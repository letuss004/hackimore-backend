import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ServerConfig } from '@server/config';
import { BodyContentType, MulterFile } from '@server/platform';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { PublicApi, RoleBaseAccessControl, SwaggerApiDocument } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import {
  LocalStorageResponseDto,
  S3PresignedUrlRequestDto,
  S3PresignedUrlResponseDto,
  UploadFileBodyDto,
} from './dtos';
import { StorageService } from './storage.service';

@Controller('storage')
@ApiTags('Storage')
@UseGuards(AuthGuard)
@RoleBaseAccessControl(true)
@ApiBearerAuth()
export class StorageController {
  private static readonly storage = diskStorage({
    destination: ServerConfig.get().LOCAL_STORAGE_PATH,
  });

  constructor(private readonly localStorageService: StorageService) {}

  @Post()
  @SwaggerApiDocument({
    response: {
      type: LocalStorageResponseDto,
    },
    body: { type: UploadFileBodyDto, required: true },
    contentType: [BodyContentType.MultipartFormData],
    operation: {
      operationId: `uploadLocalFile`,
      summary: `Api uploadLocalFile`,
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: StorageController.storage,
    }),
  )
  async uploadLocalFile(
    @UploadedFile() file: MulterFile,
    @Body() body: UploadFileBodyDto,
  ): Promise<LocalStorageResponseDto> {
    return this.localStorageService.uploadLocalFile({ ...body, file });
  }

  @Get(':filename')
  @PublicApi()
  @SwaggerApiDocument({
    response: {
      type: StreamableFile,
      description: ``,
    },
    operation: {
      operationId: 'getLocalFile',
      summary: 'Api getLocalFile',
    },
  })
  async getImage(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { mimeType, fileStream, fileSize } =
      await this.localStorageService.getLocalFile(filename);

    res.type(mimeType);
    res.set('Content-Disposition', `inline; filename="${filename}"`);
    res.set('Content-Length', String(fileSize));
    res.set('Cache-Control', 'max-age=3600');
    return new StreamableFile(fileStream);
  }

  @Post('s3/presigned-url')
  @SwaggerApiDocument({
    response: {
      type: S3PresignedUrlResponseDto,
    },
    body: { type: S3PresignedUrlRequestDto, required: true },
    operation: {
      operationId: 'generateS3PresignedUrl',
      summary: 'Api generateS3PresignedUrl',
      description:
        'Generate a presigned URL that allows the frontend to upload files directly to S3',
    },
  })
  async generateS3PresignedUrl(
    @Body() body: S3PresignedUrlRequestDto,
  ): Promise<S3PresignedUrlResponseDto> {
    return this.localStorageService.generatePresignedUrl(body);
  }
}
