import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ServerConfig } from '@server/config';
import { DatabaseService } from 'src/module/base/database';
import {
  LocalStorageResponseDto,
  S3PresignedUrlRequestDto,
  S3PresignedUrlResponseDto,
  UploadFileBodyDto,
} from './dtos';

@Injectable()
export class StorageService {
  private s3Client: S3Client;

  constructor(private readonly databaseService: DatabaseService) {
    const config = ServerConfig.get();
    this.s3Client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadLocalFile(body: UploadFileBodyDto): Promise<LocalStorageResponseDto> {
    return undefined;
  }

  async getLocalFile(filename: string) {
    return undefined;
  }

  async generatePresignedUrl(
    request: S3PresignedUrlRequestDto,
  ): Promise<S3PresignedUrlResponseDto> {
    const config = ServerConfig.get();
    const bucket = config.S3_BUCKET_NAME;

    if (!bucket) {
      throw new Error('S3_BUCKET_NAME is not configured');
    }

    // Generate S3 key (path + filename)
    const key = request.folder
      ? `${request.folder.replace(/^\/+|\/+$/g, '')}/${request.filename}`
      : request.filename;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: request.contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: config.S3_PRESIGNED_URL_EXPIRES,
    });

    return {
      presignedUrl,
      key,
      bucket,
      expiresIn: config.S3_PRESIGNED_URL_EXPIRES,
    };
  }
}
