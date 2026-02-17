import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { OnModuleInit } from '@nestjs/common';
import { ServerConfig } from '@server/config';
import { Time } from '@server/libs/time';
import { ServerLogger } from '@server/logger';
import { Job, Queue } from 'bullmq';
import { spawn } from 'child_process';
import { S3Service } from 'src/integration/aws';
import { SystemJobName, SystemQueueName } from 'src/module/system/system.enum';
import { PassThrough } from 'stream';
import { createGzip } from 'zlib';
import { BackupDatabaseDailyJobData } from '../system.type';

@Processor(SystemQueueName.BackupDatabase)
export class BackupDatabaseProcessor extends WorkerHost implements OnModuleInit {
  constructor(
    private readonly s3Service: S3Service,
    @InjectQueue(SystemQueueName.BackupDatabase)
    private readonly backupDatabaseQueue: Queue,
  ) {
    super();
  }

  async onModuleInit() {
    // Schedule daily backup job at midnight (00:00)
    await this.ensureQueueActiveAsCron();
  }

  async process(job: Job<BackupDatabaseDailyJobData>, token?: string): Promise<any> {
    const { cleanup, message } = await this.backupDatabaseDaily(job);
    if (cleanup) {
      await this.cleanupOldBackups();
    }
    return message;
  }

  private async backupDatabaseDaily(job: Job<BackupDatabaseDailyJobData>) {
    const { forceBackup } = job.data;
    const time = Time().format('DD-MM-YYYY');
    const backupFolder = `database-backups/${time}/`;
    const backupFileName = `backup-${Time().toISOString()}.sql.gz`;
    const backupFilePath = `${backupFolder}${backupFileName}`;

    if (ServerConfig.isLocalEnv()) {
      return {
        cleanup: false,
        message: 'Database backup skipped in local environment',
      };
    }

    // Check if backup already exists
    const backupExist = await this.s3Service.checkExists(backupFolder);
    if (!forceBackup && backupExist) {
      return {
        cleanup: false,
        message: `Backup already exists at ${backupFolder}`,
      };
    }

    try {
      // Get database credentials from DATABASE_URL
      const { user, password, host, port, database } =
        ServerConfig.getDatabaseCredentials();

      ServerLogger.info({
        context: 'BackupDatabaseProcessor.backupDatabaseDaily',
        message: 'Starting database backup',
        meta: { database, host, time },
      });

      // Create pg_dump process with data-only flag
      const pgDumpArgs = [
        '--column-inserts', // Insert data with column names
        '--data-only', // Only dump data, not schema
        '--no-owner', // Skip commands to set ownership
        '--no-acl', // Skip commands to set ACL
        '-h',
        host,
        '-p',
        port,
        '-U',
        user,
        '-d',
        database,
      ];

      const pgDump = spawn('pg_dump', pgDumpArgs, {
        env: {
          ...process.env,
          PGPASSWORD: password, // Pass password via environment variable (secure)
        },
      });

      // Create gzip compression stream
      const gzip = createGzip();

      // Create pass-through stream to collect data
      const passThrough = new PassThrough();

      // Pipe pg_dump output through gzip to pass-through
      pgDump.stdout.pipe(gzip).pipe(passThrough);

      // Collect all chunks into a buffer for S3 upload
      const chunks: Buffer[] = [];
      passThrough.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      // Handle pg_dump errors
      pgDump.stderr.on('data', (data: Buffer) => {
        const errorMessage = data.toString();
        ServerLogger.warn({
          context: 'BackupDatabaseProcessor.backupDatabaseDaily',
          message: 'pg_dump stderr output',
          meta: { error: errorMessage },
        });
      });

      // Wait for the backup to complete
      await new Promise<void>((resolve, reject) => {
        pgDump.on('error', (error) => {
          ServerLogger.error({
            error,
            context: 'BackupDatabaseProcessor.backupDatabaseDaily',
            message: 'pg_dump process error',
          });
          reject(error);
        });

        pgDump.on('close', (code) => {
          if (code !== 0) {
            const error = new Error(`pg_dump exited with code ${code}`);
            ServerLogger.error({
              error,
              context: 'BackupDatabaseProcessor.backupDatabaseDaily',
              message: 'pg_dump process failed',
              meta: { exitCode: code },
            });
            reject(error);
          } else {
            resolve();
          }
        });

        passThrough.on('end', resolve);
        passThrough.on('error', reject);
      });

      // Combine all chunks into a single buffer
      const backupBuffer = Buffer.concat(chunks);

      ServerLogger.info({
        context: 'BackupDatabaseProcessor.backupDatabaseDaily',
        message: 'Database backup completed, uploading to S3',
        meta: { sizeBytes: backupBuffer.length, backupFilePath },
      });

      // Upload the backup file to S3
      await this.s3Service.uploadFile({
        bucketName: ServerConfig.get().S3_BUCKET_NAME,
        key: backupFilePath,
        body: backupBuffer,
        contentType: 'application/gzip',
      });

      ServerLogger.info({
        context: 'BackupDatabaseProcessor.backupDatabaseDaily',
        message: 'Database backup uploaded successfully',
        meta: { backupFilePath, sizeBytes: backupBuffer.length },
      });

      return {
        message: `Database backup created and uploaded to S3 at ${backupFilePath}`,
        sizeBytes: backupBuffer.length,
        cleanup: true,
      };
    } catch (error) {
      ServerLogger.error({
        error,
        context: 'BackupDatabaseProcessor.backupDatabaseDaily',
        message: 'Failed to backup database',
      });
      throw error;
    }
  }

  /**
   * Clean up old backups, keeping only the 7 most recent backup folders
   */
  private async cleanupOldBackups() {
    try {
      const bucketName = ServerConfig.get().S3_BUCKET_NAME;
      const backupPrefix = 'database-backups/';

      ServerLogger.info({
        context: 'BackupDatabaseProcessor.cleanupOldBackups',
        message: 'Starting cleanup of old backups',
      });

      // List all objects in the database-backups folder
      const result = await this.s3Service.listObjects({
        Bucket: bucketName,
        Prefix: backupPrefix,
      });

      if (!result.Contents || result.Contents.length === 0) {
        ServerLogger.info({
          context: 'BackupDatabaseProcessor.cleanupOldBackups',
          message: 'No backup files found',
        });
        return;
      }

      // Group files by backup folder (date)
      const backupFolders = new Map<string, Array<{ key: string; lastModified: Date }>>();

      for (const obj of result.Contents) {
        if (!obj.Key || !obj.LastModified) continue;

        // Extract folder name from key (e.g., "database-backups/07-01-2026/" -> "07-01-2026")
        const match = obj.Key.match(/^database-backups\/([^/]+)\//);
        if (match && match[1]) {
          const folderName = match[1];
          if (!backupFolders.has(folderName)) {
            backupFolders.set(folderName, []);
          }
          backupFolders.get(folderName)!.push({
            key: obj.Key,
            lastModified: obj.LastModified,
          });
        }
      }

      // Sort folders by the most recent file's LastModified date
      const sortedFolders = Array.from(backupFolders.entries())
        .map(([folderName, files]) => ({
          folderName,
          files,
          mostRecentDate: new Date(
            Math.max(...files.map((f) => f.lastModified.getTime())),
          ),
        }))
        .sort((a, b) => b.mostRecentDate.getTime() - a.mostRecentDate.getTime());

      ServerLogger.info({
        context: 'BackupDatabaseProcessor.cleanupOldBackups',
        message: `Found ${sortedFolders.length} backup folders`,
        meta: { totalFolders: sortedFolders.length },
      });

      // Keep only the 7 most recent folders, delete the rest
      const foldersToDelete = sortedFolders.slice(7);

      if (foldersToDelete.length === 0) {
        ServerLogger.info({
          context: 'BackupDatabaseProcessor.cleanupOldBackups',
          message: 'No old backups to delete (less than 8 backup folders)',
          meta: { currentBackupCount: sortedFolders.length },
        });
        return;
      }

      let deletedCount = 0;
      for (const folder of foldersToDelete) {
        for (const file of folder.files) {
          await this.s3Service.deleteObject({
            Bucket: bucketName,
            Key: file.key,
          });
          deletedCount++;
          ServerLogger.info({
            context: 'BackupDatabaseProcessor.cleanupOldBackups',
            message: `Deleted old backup file`,
            meta: { key: file.key, folder: folder.folderName },
          });
        }
      }

      ServerLogger.info({
        context: 'BackupDatabaseProcessor.cleanupOldBackups',
        message: 'Cleanup completed successfully',
        meta: {
          foldersDeleted: foldersToDelete.length,
          filesDeleted: deletedCount,
          foldersKept: 7,
        },
      });
    } catch (error) {
      ServerLogger.error({
        error,
        context: 'BackupDatabaseProcessor.cleanupOldBackups',
        message: 'Failed to cleanup old backups',
      });
      // Don't throw error - cleanup failure shouldn't fail the backup process
    }
  }

  private async ensureQueueActiveAsCron() {
    try {
      // Remove any existing repeatable jobs for this job name
      const repeatableJobs = await this.backupDatabaseQueue.getJobSchedulers();
      for (const job of repeatableJobs) {
        if (job.name === SystemJobName.BackupDatabaseDaily) {
          ServerLogger.info({
            context: 'TaskScheduleService.scheduleBackupDatabaseDaily',
            message: 'Daily database backup job already scheduled',
            meta: { pattern: '0 0 * * *' },
          });
          return;
        }
      }

      // Add repeatable job - runs daily at midnight
      await this.backupDatabaseQueue.add(SystemJobName.BackupDatabaseDaily, null, {
        repeat: {
          pattern: '0 0 * * *', // Every day at 00:00 (midnight)
        },
        removeOnComplete: false,
        removeOnFail: false,
      });

      ServerLogger.info({
        context: 'TaskScheduleService.scheduleBackupDatabaseDaily',
        message: 'Scheduled daily database backup job',
        meta: { pattern: '0 0 * * *' },
      });
    } catch (error) {
      ServerLogger.error({
        error,
        context: 'TaskScheduleService.scheduleBackupDatabaseDaily',
        message: 'Failed to schedule daily database backup job',
      });
    }
  }
}
