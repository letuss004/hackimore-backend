# Backup Database Processor

## Overview

This processor implements daily PostgreSQL database backup using `pg_dump` with data-only mode.

## Implementation Approach: Node.js vs Shell Script

### ✅ Chosen: Node.js with child_process

We chose to implement the backup using Node.js `spawn` instead of shell scripts for the following reasons:

#### Advantages:
1. **Better streaming**: Direct stream from `pg_dump → gzip → S3` without temporary files
2. **Superior error handling**: TypeScript error handling with detailed logging
3. **Security**: Password passed via `PGPASSWORD` environment variable, not exposed in process list
4. **Maintainability**: All code in TypeScript, easier to maintain and test
5. **Cross-platform**: Works on Linux, macOS, Windows (if pg_dump is installed)
6. **Integration**: Seamless integration with Bull queue and S3Service

#### Why NOT Shell Script:
1. ❌ Not portable (bash/sh doesn't work on Windows)
2. ❌ Weaker error handling
3. ❌ Security risk with password exposure
4. ❌ Harder to write unit tests
5. ❌ Logic scattered across multiple files

## Technical Details

### Architecture Flow:
```
1. Check if backup already exists in S3
2. Parse database credentials from DATABASE_URL
3. Spawn pg_dump process:
   - Uses --data-only flag (only data, no schema)
   - Password via PGPASSWORD env var
4. Stream stdout through gzip compression
5. Collect compressed data in memory
6. Upload to S3 with proper content-type
7. Log success/failure
```

### Key Components:

#### 1. Process Spawning
```typescript
const pgDump = spawn('pg_dump', pgDumpArgs, {
  env: {
    ...process.env,
    PGPASSWORD: password, // Secure password passing
  },
});
```

#### 2. Stream Pipeline
```typescript
pgDump.stdout
  .pipe(gzip)           // Compress with gzip
  .pipe(passThrough);   // Collect data
```

#### 3. Error Handling
- Process errors (spawn failures)
- Exit code validation (non-zero = failure)
- Stream errors
- S3 upload errors

### Security Features:
1. ✅ Password via environment variable (not CLI args)
2. ✅ No password in logs
3. ✅ Proper cleanup on errors
4. ✅ S3 bucket verification before upload

## Requirements

### System Dependencies:
- `postgresql-client` package (provides pg_dump)
- Already added to Dockerfile: `RUN apk add --no-cache postgresql-client`

### Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string
- `AWS_S3_BUCKET_NAME`: S3 bucket for backups
- AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)

## Usage

### Via Bull Queue:
```typescript
// Add job to queue
await backupQueue.add(SystemJobName.BackupDatabaseDaily, null);
```

### Via Scheduler:
```typescript
// Scheduled daily at midnight
@Cron('0 0 * * *')
async backupDatabaseDaily() {
  // Triggers the job
}
```

## Output

### S3 Path Format:
```
database-backups/{DD-MM-YYYY}/backup-{DD-MM-YYYY}.sql.gz
```

### Example:
```
s3://your-bucket/database-backups/07-01-2026/backup-07-01-2026.sql.gz
```

## Error Scenarios

### Handled Cases:
1. ✅ Backup already exists → Skip, return message
2. ✅ pg_dump not found → Process error, logged
3. ✅ pg_dump fails (exit code ≠ 0) → Logged with exit code
4. ✅ Database connection fails → Logged from stderr
5. ✅ S3 upload fails → Logged with error details
6. ✅ Stream errors → Promise rejected

## Monitoring

### Logs to Watch:
- Context: `BackupDatabaseProcessor.backupDatabaseDaily`
- Success: INFO level with backup size
- Warnings: pg_dump stderr output
- Errors: Failed process, upload failures

### Metrics:
- Backup file size (should be consistent)
- Execution time
- Success/failure rate

## Alternative Considered: Shell Script

### What it would look like:
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DATE=$(date +%d-%m-%Y)
BACKUP_PATH="database-backups/${BACKUP_DATE}/backup-${BACKUP_DATE}.sql.gz"

PGPASSWORD="${DB_PASSWORD}" pg_dump \
  --data-only \
  --no-owner \
  --no-acl \
  -h "${DB_HOST}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  | gzip > /tmp/backup.sql.gz

# Upload to S3
aws s3 cp /tmp/backup.sql.gz "s3://${S3_BUCKET}/${BACKUP_PATH}"
```

### Why we didn't choose this:
1. Requires external file management
2. Harder to integrate with TypeScript codebase
3. Less control over error handling
4. Temporary file needed (/tmp/backup.sql.gz)
5. Less testable

## Testing

### Manual Test:
```bash
# Via Bull Board or API endpoint
POST /system/backup-database
```

### Verify:
1. Check S3 bucket for new file
2. Download and verify file can be gunzipped
3. Verify SQL content is valid

### Restore Test:
```bash
# Download backup
aws s3 cp s3://bucket/database-backups/07-01-2026/backup-07-01-2026.sql.gz .

# Decompress
gunzip backup-07-01-2026.sql.gz

# Restore to test database
PGPASSWORD=password psql -U user -d test_db < backup-07-01-2026.sql
```

## Future Enhancements

1. **Streaming upload**: Stream directly to S3 instead of buffering in memory
2. **Parallel dump**: Use pg_dump `-j` flag for parallel table dumps
3. **Incremental backup**: Only backup changed data
4. **Backup verification**: Auto-verify backup after upload
5. **Retention policy**: Auto-delete old backups
6. **Notification**: Email/Slack notification on success/failure
7. **Metrics**: Prometheus metrics for monitoring

