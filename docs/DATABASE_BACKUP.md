# Database Backup System

## Tổng quan

Hệ thống backup database tự động hằng ngày sử dụng Bull queue và upload lên AWS S3.

## Kiến trúc

```
BackupDatabaseProcessor (BullMQ Worker)
  ├─> Parse database credentials từ DATABASE_URL
  ├─> Spawn pg_dump process với flag --data-only
  ├─> Stream output qua gzip compression
  ├─> Upload lên S3 bucket
  └─> Log kết quả và error handling
```

## Phương pháp đã chọn: Node.js với child_process

### ✅ Lý do lựa chọn:
1. **Streaming hiệu quả**: Stream trực tiếp pg_dump → gzip → S3, không cần file tạm
2. **Security tốt hơn**: Password được truyền qua environment variable `PGPASSWORD`, không expose trong process list
3. **Error handling mạnh mẽ**: TypeScript cho phép catch và log errors chi tiết
4. **Tích hợp tốt**: Code nằm trong TypeScript, dễ maintain và test
5. **Cross-platform**: Chạy được trên nhiều OS (miễn có pg_dump installed)

### ❌ Tại sao không dùng Shell Script:
1. Không portable (bash/sh không chạy trên Windows)
2. Error handling kém hơn
3. Security risk khi expose password
4. Khó viết unit test

## Cấu hình

### Environment Variables
```bash
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/hackimore?ssl-mode=REQUIRED
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### pg_dump flags sử dụng:
- `--data-only`: Chỉ backup data, không backup schema
- `--no-owner`: Skip commands để set ownership
- `--no-acl`: Skip commands để set ACL

## Yêu cầu hệ thống

### 1. pg_dump phải được cài đặt

#### Trên Ubuntu/Debian:
```bash
apt-get update
apt-get install -y postgresql-client
```

#### Trên Alpine Linux (Docker):
```dockerfile
RUN apk add --no-cache postgresql-client
```

#### Trên macOS:
```bash
brew install postgresql
```

### 2. Kiểm tra pg_dump đã cài:
```bash
pg_dump --version
```

## Cách chạy

### Manual trigger (qua API hoặc Bull Board):
1. Truy cập Bull Board dashboard
2. Tìm queue: `BackupDatabase`
3. Add job với name: `BackupDatabaseDaily`

### Scheduled (tự động):
- Được schedule bởi `TaskScheduleService` (nếu có cron job)
- Hoặc config trong Bull queue repeatable jobs

## Output

### Format file:
```
database-backups/{DD-MM-YYYY}/backup-{DD-MM-YYYY}.sql.gz
```

### Ví dụ:
```
database-backups/07-01-2026/backup-07-01-2026.sql.gz
```

## Error Handling

### Các trường hợp được xử lý:
1. ✅ Backup đã tồn tại → Skip và return message
2. ✅ pg_dump process error → Log và throw error
3. ✅ pg_dump exit code khác 0 → Log và throw error
4. ✅ S3 upload failed → Log và throw error
5. ✅ Stream errors → Log và reject promise

### Logs
Tất cả operations được log với context:
- `BackupDatabaseProcessor.backupDatabaseDaily`
- Level: INFO, WARN, ERROR
- Meta data: database name, host, backup path, file size, etc.

## Restore Database

### Tải backup từ S3:
```bash
aws s3 cp s3://your-bucket/database-backups/07-01-2026/backup-07-01-2026.sql.gz .
```

### Giải nén:
```bash
gunzip backup-07-01-2026.sql.gz
```

### Restore vào database:
```bash
psql -U myuser -d hackimore -h localhost -p 5432 < backup-07-01-2026.sql
```

Hoặc với PGPASSWORD:
```bash
PGPASSWORD=mypassword psql -U myuser -d hackimore -h localhost -p 5432 < backup-07-01-2026.sql
```

## Monitoring

### Metrics cần theo dõi:
1. **Job success rate**: Tỷ lệ backup thành công
2. **Backup file size**: Kích thước file backup (để detect issues)
3. **Execution time**: Thời gian thực thi
4. **S3 storage**: Dung lượng lưu trữ trên S3

### Alert conditions:
- Job failed liên tục
- File size bất thường (quá nhỏ hoặc quá lớn)
- Execution time quá lâu (> X phút)

## Best Practices

### 1. Retention Policy
Nên implement retention policy để xóa backup cũ:
```typescript
// Ví dụ: giữ backup 30 ngày gần nhất
// Delete backups older than 30 days
```

### 2. Backup Testing
Định kỳ test restore backup để đảm bảo backup hoạt động:
- Random sampling: chọn ngẫu nhiên backup để test
- Restore vào test database
- Verify data integrity

### 3. Multi-region Backup
Consider backup to multiple S3 regions hoặc cross-region replication

### 4. Encryption
Enable S3 server-side encryption (SSE-S3 hoặc SSE-KMS)

## Troubleshooting

### Lỗi: "pg_dump: command not found"
**Nguyên nhân**: pg_dump chưa được cài đặt
**Giải pháp**: Install postgresql-client (xem phần "Yêu cầu hệ thống")

### Lỗi: "FATAL: password authentication failed"
**Nguyên nhân**: Password không đúng trong DATABASE_URL
**Giải pháp**: Kiểm tra lại DATABASE_URL environment variable

### Lỗi: "pg_dump exited with code 1"
**Nguyên nhân**: Có thể database không tồn tại, permission issues, etc.
**Giải pháp**: Check pg_dump stderr logs trong application logs

### Lỗi: S3 upload failed
**Nguyên nhân**: AWS credentials không đúng, network issues, bucket không tồn tại
**Giải pháp**: 
- Verify AWS credentials
- Check S3 bucket permissions
- Check network connectivity

## Security Notes

### ⚠️ Quan trọng:
1. **NEVER** commit DATABASE_URL vào git
2. **NEVER** expose password trong logs
3. **ALWAYS** use environment variables cho credentials
4. **ENABLE** S3 bucket encryption
5. **RESTRICT** S3 bucket access với IAM policies
6. **ROTATE** AWS credentials định kỳ

## Performance Considerations

### 1. Compression
- Sử dụng gzip compression để giảm storage cost và transfer time
- Trade-off: CPU usage vs storage cost

### 2. Network Bandwidth
- Large databases có thể mất nhiều thời gian upload
- Consider scheduling backup vào off-peak hours

### 3. Database Load
- `pg_dump` có thể tạo load trên database
- Consider using read replica cho backup nếu cần

## Future Improvements

1. **Incremental Backup**: Chỉ backup changed data
2. **Parallel Backup**: Sử dụng pg_dump với `-j` flag
3. **Backup Verification**: Auto-verify backup integrity
4. **Notification**: Send notification khi backup success/failed
5. **Retention Policy**: Auto-delete old backups
6. **Metrics Dashboard**: Visualize backup metrics

