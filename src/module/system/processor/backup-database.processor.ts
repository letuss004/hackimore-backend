import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ServerConfig } from '@server/config';
import { Time } from '@server/libs/time';
import { ServerLogger } from '@server/logger';
import { Job } from 'bullmq';
import { spawn } from 'child_process';
import { S3Service } from 'src/integration/aws';
import { SystemJobName, SystemQueueName } from 'src/module/system/system.enum';
import { PassThrough } from 'stream';
import { createGzip } from 'zlib';

@Processor(SystemQueueName.BackupDatabase)
export class BackupDatabaseProcessor extends WorkerHost {
  constructor(private readonly s3Service: S3Service) {
    super();
  }

  async process(job: Job<null>, token?: string): Promise<any> {
    switch (job.name) {
      case SystemJobName.BackupDatabaseDaily:
        return this.backupDatabaseDaily(job);
      default:
    }
  }

  private async backupDatabaseDaily(job: Job<null>) {
    // const {} = job.data;
    const time = Time().format('DD-MM-YYYY');
    const backupFolder = `database-backups/${time}/`;
    const backupFileName = `backup-${time}.sql.gz`;
    const backupFilePath = `${backupFolder}${backupFileName}`;

    // Check if backup already exists
    if (await this.s3Service.checkExists(backupFilePath)) {
      ServerLogger.info({
        context: 'BackupDatabaseProcessor.backupDatabaseDaily',
        message: `Backup already exists for ${time}`,
        meta: { backupFilePath },
      });
      return {
        message: `Backup already exists at ${backupFilePath}`,
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
}
