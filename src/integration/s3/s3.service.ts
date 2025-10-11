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
import { Injectable } from '@nestjs/common';
import { ServerLogger } from '@server/logger';

@Injectable()
export class S3Service extends S3Client {
  constructor() {
    super({});
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
}
