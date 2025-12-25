import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AsyncStorage } from '@server/async-storage';
import { ServerConfig } from '@server/config';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
import { S3Service } from 'src/integration/aws';
import { DatabaseService } from 'src/module/base/database';
import {
  CreatePhraseAudioBodyDto,
  CreatePhraseAudioResponseDto,
  GetPhraseAudioDetailResponseDto,
  GetPhraseAudioListQueryDto,
  GetPhraseAudioListResponseDto,
  UpdatePhraseAudioBodyDto,
  UpdatePhraseAudioResponseDto,
} from './dtos';

@Injectable()
export class PhraseAudioService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly s3Service: S3Service,
  ) {}

  async createPhraseAudio(
    body: CreatePhraseAudioBodyDto,
  ): Promise<CreatePhraseAudioResponseDto> {
    const userId = AsyncStorage.getCurrentUserId();
    const { s3Object: createS3Object, ...createAudioData } = body;
    const { S3_BUCKET_NAME } = ServerConfig.get();

    const phase = await this.databaseService.phrase.findFirst({
      where: { id: createAudioData.phraseId },
    });
    if (!phase) {
      throw new ServerException({
        ...ERROR_RESPONSE.RESOURCE_NOT_FOUND,
        message: `Phrase with id ${createAudioData.phraseId} not found`,
      });
    }
    const s3Objet = await this.s3Service
      .getObject({
        Bucket: S3_BUCKET_NAME,
        Key: createS3Object.key,
      })
      .catch((error) => {
        throw new ServerException({
          ...ERROR_RESPONSE.RESOURCE_NOT_FOUND,
          message: `S3 Object with key ${createS3Object.key} not found`,
          details: { message: error.message },
        });
      });

    const fileObject = await this.databaseService.s3Object.create({
      data: { ...createS3Object, userId, eTag: s3Objet.ETag, bucket: S3_BUCKET_NAME },
    });
    return this.databaseService.phraseAudio.create({
      data: {
        ...createAudioData,
        s3ObjectId: fileObject.id,
      },
    });
  }

  async getPhraseAudioList(
    query: GetPhraseAudioListQueryDto,
  ): Promise<PaginationResponseDto<GetPhraseAudioListResponseDto>> {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.PhraseAudioWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.phraseId && { phraseId: query.phraseId }),
      ...(query.s3ObjectId && { s3ObjectId: query.s3ObjectId }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.phraseAudio.findMany({
        where,
        take,
        skip,
        orderBy: parseOrderByFromQuery(query.orderBy),
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.phraseAudio.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getPhraseAudioDetail(id: number): Promise<GetPhraseAudioDetailResponseDto> {
    const phraseAudio = await this.databaseService.phraseAudio.findFirst({
      where: { id },
    });
    if (!phraseAudio) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return phraseAudio;
  }

  async updatePhraseAudio(
    id: number,
    body: UpdatePhraseAudioBodyDto,
  ): Promise<UpdatePhraseAudioResponseDto> {
    const phraseAudio = await this.databaseService.phraseAudio.findFirst({
      where: { id },
    });
    if (!phraseAudio) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phraseAudio.update({
      where: { id },
      data: { ...body },
    });
  }

  async deletePhraseAudio(id: number) {
    const phraseAudio = await this.databaseService.phraseAudio.findFirst({
      where: { id },
    });
    if (!phraseAudio) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phraseAudio.delete({ where: { id } });
  }
}
