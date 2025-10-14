import { Injectable } from '@nestjs/common';
import { ServerConfig } from '@server/config';
import { S3Service } from 'src/integration/aws/s3.service';
import { DatabaseService } from 'src/module/base/database';
import {
  GetDownloadPresignedUrlBodyDto,
  GetUploadPresignedUrlBodyDto,
  GetUploadPresignedUrlResponseDto,
  LocalStorageResponseDto,
  UploadFileBodyDto,
} from './dtos';

@Injectable()
export class StorageService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly s3Service: S3Service,
  ) {}

  async uploadLocalFile(body: UploadFileBodyDto): Promise<LocalStorageResponseDto> {
    // TODO: Implement local file upload logic
    return undefined;
  }

  async getLocalFile(filename: string) {
    // TODO: Implement local file retrieval logic
    return undefined;
  }

  async getUploadPresignedUrl(
    body: GetUploadPresignedUrlBodyDto,
  ): Promise<GetUploadPresignedUrlResponseDto> {
    const { filename, contentType } = body;
    const { S3_BUCKET_NAME, S3_PRESIGNED_URL_EXPIRES } = ServerConfig.get();
    const folder = 'phrase';
    let key = folder ? `${folder}/${filename}` : filename;
    const url = await this.s3Service.getPresignedUploadUrl(
      S3_BUCKET_NAME,
      key,
      contentType,
      S3_PRESIGNED_URL_EXPIRES,
    );
    return { url, key };
  }

  async getDownloadPresignedUrl(
    body: GetDownloadPresignedUrlBodyDto,
  ): Promise<GetUploadPresignedUrlResponseDto> {
    const { key } = body;
    const { S3_BUCKET_NAME, S3_PRESIGNED_URL_EXPIRES } = ServerConfig.get();
    const url = await this.s3Service.getPresignedDownloadUrl(
      S3_BUCKET_NAME,
      key,
      S3_PRESIGNED_URL_EXPIRES,
    );
    return { url, key };
  }
}
