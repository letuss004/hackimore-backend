import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  CreateBucketCommand,
  CreateBucketCommandInput,
  DeleteBucketCommand,
  DeleteBucketCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  HeadObjectCommand,
  HeadObjectCommandInput,
  ListBucketsCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  PutObjectAclCommand,
  PutObjectAclCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ServerLogger } from '@server/logger';

@Injectable()
export class S3Service extends S3Client {
  constructor() {
    super({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadObject(params: PutObjectCommandInput) {
    const command = new PutObjectCommand(params);
    return this.send(command).catch((error) => {
      ServerLogger.error({
        error,
        context: `S3Service.uploadObject`,
        message: `S3Service.uploadObject: got an error`,
      });
      throw error;
    });
  }

  async getObject(params: GetObjectCommandInput) {
    const command = new GetObjectCommand(params);
    return this.send(command).catch((error) => {
      ServerLogger.error({
        error,
        context: `S3Service.getObject`,
        message: `S3Service.getObject: got an error`,
      });
      throw error;
    });
  }

  async listObjects(params: ListObjectsV2CommandInput) {
    const command = new ListObjectsV2Command(params);
    return this.send(command).catch((error) => {
      ServerLogger.error({
        error,
        context: `S3Service.listObjects`,
        message: `S3Service.listObjects: got an error`,
      });
      throw error;
    });
  }

  async deleteObject(params: DeleteObjectCommandInput) {
    const command = new DeleteObjectCommand(params);
    return this.send(command).catch((error) => {
      ServerLogger.error({
        error,
        context: `S3Service.deleteObject`,
        message: `S3Service.deleteObject: got an error`,
      });
      throw error;
    });
  }

  async copyObject(params: CopyObjectCommandInput) {
    const command = new CopyObjectCommand(params);
    return this.send(command).catch((error) => {
      ServerLogger.error({
        error,
        context: `S3Service.copyObject`,
        message: `S3Service.copyObject: got an error`,
      });
      throw error;
    });
  }

  async getObjectMetadata(params: HeadObjectCommandInput) {
    const command = new HeadObjectCommand(params);
    return this.send(command).catch((error) => {
      ServerLogger.error({
        error,
        context: `S3Service.getObjectMetadata`,
        message: `S3Service.getObjectMetadata: got an error`,
      });
      throw error;
    });
  }

  async createBucket(params: CreateBucketCommandInput) {
    const command = new CreateBucketCommand(params);
    return this.send(command).catch((error) => {
      ServerLogger.error({
        error,
        context: `S3Service.createBucket`,
        message: `S3Service.createBucket: got an error`,
      });
      throw error;
    });
  }

  async deleteBucket(params: DeleteBucketCommandInput) {
    const command = new DeleteBucketCommand(params);
    return this.send(command).catch((error) => {
      ServerLogger.error({
        error,
        context: `S3Service.deleteBucket`,
        message: `S3Service.deleteBucket: got an error`,
      });
      throw error;
    });
  }

  async setObjectAcl(params: PutObjectAclCommandInput) {
    const command = new PutObjectAclCommand(params);
    return this.send(command);
  }

  async listBuckets() {
    return this.send(new ListBucketsCommand({}));
  }

  /**
   * Generate a presigned URL for downloading an object from S3
   * @param bucket - The S3 bucket name
   * @param key - The object key
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns Promise<string> - The presigned URL
   */
  async getPresignedDownloadUrl(
    bucket: string,
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this, command, { expiresIn });

      ServerLogger.info({
        context: 'S3Service.getPresignedDownloadUrl',
        message: `Generated presigned download URL for ${bucket}/${key}`,
        meta: { bucket, key, expiresIn },
      });

      return presignedUrl;
    } catch (error) {
      ServerLogger.error({
        error,
        context: 'S3Service.getPresignedDownloadUrl',
        message: 'Failed to generate presigned download URL',
        meta: { bucket, key, expiresIn },
      });
      throw error;
    }
  }

  /**
   * Generate a presigned URL for uploading an object to S3
   * @param bucket - The S3 bucket name
   * @param key - The object key
   * @param contentType - The content type of the object (optional)
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns Promise<string> - The presigned URL
   */
  async getPresignedUploadUrl(
    bucket: string,
    key: string,
    contentType?: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const putObjectParams: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
      };

      if (contentType) {
        putObjectParams.ContentType = contentType;
      }

      const command = new PutObjectCommand(putObjectParams);
      const presignedUrl = await getSignedUrl(this, command, { expiresIn });

      ServerLogger.info({
        context: 'S3Service.getPresignedUploadUrl',
        message: `Generated presigned upload URL for ${bucket}/${key}`,
        meta: { bucket, key, contentType, expiresIn },
      });

      return presignedUrl;
    } catch (error) {
      ServerLogger.error({
        error,
        context: 'S3Service.getPresignedUploadUrl',
        message: 'Failed to generate presigned upload URL',
        meta: { bucket, key, contentType, expiresIn },
      });
      throw error;
    }
  }

  /**
   * Generate a presigned URL with custom parameters
   * @param command - The S3 command to sign
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns Promise<string> - The presigned URL
   */
  async getCustomPresignedUrl(
    command: GetObjectCommand | PutObjectCommand,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const presignedUrl = await getSignedUrl(this, command, { expiresIn });

      ServerLogger.info({
        context: 'S3Service.getCustomPresignedUrl',
        message: `Generated custom presigned URL`,
        meta: { commandName: command.constructor.name, expiresIn },
      });

      return presignedUrl;
    } catch (error) {
      ServerLogger.error({
        error,
        context: 'S3Service.getCustomPresignedUrl',
        message: 'Failed to generate custom presigned URL',
        meta: { commandName: command.constructor.name, expiresIn },
      });
      throw error;
    }
  }
}
