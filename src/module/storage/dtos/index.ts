import { MulterFile } from '@server/platform';
import { PropertyDto } from 'src/decorator';

// ****************************** Base LocalStorage response dto ******************************
export class LocalStorageResponseDto {
  @PropertyDto()
  id: number;

  @PropertyDto()
  userId?: number;

  @PropertyDto()
  eTag: string;

  @PropertyDto()
  location: string;

  @PropertyDto()
  key: string;

  @PropertyDto()
  bucket: string;

  @PropertyDto()
  filename?: string;

  @PropertyDto()
  mimetype?: string;

  @PropertyDto()
  size?: number;

  @PropertyDto()
  originalname?: string;

  @PropertyDto()
  createdAt: Date;

  @PropertyDto()
  updatedAt: Date;
}

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

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  imageWidth: number;

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
  })
  imageHeight: number;
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

  @PropertyDto({
    type: String,
    required: false,
    validated: true,
    description: 'Optional folder path within the S3 bucket',
  })
  folder?: string;
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
