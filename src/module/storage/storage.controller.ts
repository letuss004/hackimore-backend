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
  GetDownloadPresignedUrlBodyDto,
  GetUploadPresignedUrlBodyDto,
  GetUploadPresignedUrlResponseDto,
  LocalStorageResponseDto,
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

  @Post('presigned-upload-url')
  @SwaggerApiDocument({
    response: {
      type: GetUploadPresignedUrlResponseDto,
    },
    body: { type: GetUploadPresignedUrlBodyDto, required: true },
    operation: {
      operationId: 'getUploadPresignedUrl',
      summary: 'Get S3 presigned URL for uploading files',
      description: 'Generate a presigned URL that allows uploading files directly to S3',
    },
  })
  async getUploadPresignedUrl(
    @Body() body: GetUploadPresignedUrlBodyDto,
  ): Promise<GetUploadPresignedUrlResponseDto> {
    return this.localStorageService.getUploadPresignedUrl(body);
  }

  @Post('presigned-download-url')
  @SwaggerApiDocument({
    response: {
      type: GetUploadPresignedUrlResponseDto,
    },
    body: { type: GetDownloadPresignedUrlBodyDto, required: true },
    operation: {
      operationId: 'getDownloadPresignedUrl',
      summary: 'Get S3 presigned URL for downloading files',
      description:
        'Generate a presigned URL that allows downloading files directly from S3',
    },
  })
  async getDownloadPresignedUrl(
    @Body() body: GetDownloadPresignedUrlBodyDto,
  ): Promise<GetUploadPresignedUrlResponseDto> {
    return this.localStorageService.getDownloadPresignedUrl(body);
  }
}
