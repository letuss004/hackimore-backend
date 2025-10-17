import { MulterFile } from '@server/platform';
import { PropertyDto } from 'src/decorator';

// ****************************** Base S3Object response dto ******************************
export class BaseS3ObjectResponseDto {
  @PropertyDto()
  id: number;

  @PropertyDto()
  userId: number;

  @PropertyDto()
  eTag: string;

  @PropertyDto()
  location: string;

  @PropertyDto()
  key: string;

  @PropertyDto()
  bucket: string;

  @PropertyDto()
  filename: string;

  @PropertyDto()
  mimetype: string;

  @PropertyDto()
  size: number;

  @PropertyDto()
  originalname: string;

  @PropertyDto()
  createdAt: Date;
}

export class CreateS3ObjectBodyDto {
  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  eTag: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  location: string;

  @PropertyDto({
    type: String,
    required: true,
    validated: true,
  })
  key: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  filename: string;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  mimetype: string;

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  size: number;

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
  })
  originalname: string;
}

// ****************************** Base LocalStorage response dto ******************************
export class StorageResponseDto extends BaseS3ObjectResponseDto {}

export class UploadFileBodyDto {
  @PropertyDto({
    type: 'file',
    required: true,
    validated: true,
  })
  file: MulterFile;

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  userId: number;
}

// ****************************** getUploadPresignedUrl ******************************
export class GetUploadPresignedUrlBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    description: 'The filename for the file to be uploaded',
  })
  filename: string;

  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    description: 'The MIME type of the file',
  })
  contentType: string;

  // @PropertyDto({
  //   type: StorageType,
  //   required: true,
  //   validated: true,
  //   structure: 'enum',
  //   description: `The storage type, e.g., 'Phrase'`,
  // })
  // type: StorageType;
}

export class GetUploadPresignedUrlResponseDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    description: 'The presigned URL for S3 operations',
  })
  url: string;

  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    description: 'The S3 object key',
  })
  key: string;
}

// ****************************** getDownloadPresignedUrl ******************************
export class GetDownloadPresignedUrlBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    description: 'The S3 object key for the file to download',
  })
  key: string;
}

export class GetDownloadPresignedUrlResponseDto extends GetUploadPresignedUrlResponseDto {}
