import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AsyncStorage } from '@server/async-storage';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
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
  constructor(private readonly databaseService: DatabaseService) {}

  async createPhraseAudio(
    body: CreatePhraseAudioBodyDto,
  ): Promise<CreatePhraseAudioResponseDto> {
    const userId = AsyncStorage.getCurrentUserId();
    const fileObject = await this.databaseService.s3Object.create({
      data: { ...body.s3Object, userId },
    });
    return this.databaseService.phraseAudio.create({
      data: {
        ...body,
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
      ...(query.language && { language: query.language }),
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
