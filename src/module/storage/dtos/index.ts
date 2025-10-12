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

// ****************************** S3 Presigned URL DTOs ******************************
export class S3PresignedUrlRequestDto {
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

export class S3PresignedUrlResponseDto {
  @PropertyDto({
    type: String,
    description: 'The presigned URL for uploading to S3',
  })
  presignedUrl: string;

  @PropertyDto({
    type: String,
    description: 'The S3 key (path) where the file will be stored',
  })
  key: string;

  @PropertyDto({
    type: String,
    description: 'The S3 bucket name',
  })
  bucket: string;

  @PropertyDto({
    type: Number,
    description: 'URL expiration time in seconds',
  })
  expiresIn: number;
}
