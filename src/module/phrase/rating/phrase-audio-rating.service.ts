import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
import { DatabaseService } from 'src/module/base/database';
import {
  CreatePhraseAudioRatingBodyDto,
  CreatePhraseAudioRatingResponseDto,
  GetPhraseAudioRatingDetailResponseDto,
  GetPhraseAudioRatingListQueryDto,
  GetPhraseAudioRatingListResponseDto,
  UpdatePhraseAudioRatingBodyDto,
  UpdatePhraseAudioRatingResponseDto,
} from './dtos';

@Injectable()
export class PhraseAudioRatingService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPhraseAudioRating(
    userId: number,
    body: CreatePhraseAudioRatingBodyDto,
  ): Promise<CreatePhraseAudioRatingResponseDto> {
    return this.databaseService.phraseAudioRating.create({
      data: { ...body, userId },
    });
  }

  async getPhraseAudioRatingList(
    userId: number,
    query: GetPhraseAudioRatingListQueryDto,
  ): Promise<GetPhraseAudioRatingListResponseDto> {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.PhraseAudioRatingWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.phraseAudioId && { phraseAudioId: query.phraseAudioId }),
      ...(query.rating && { rating: query.rating }),
      ...(query.userId && { userId: query.userId }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [items, total] = await Promise.all([
      this.databaseService.phraseAudioRating.findMany({
        where,
        take,
        skip,
        orderBy: parseOrderByFromQuery(query.orderBy),
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.phraseAudioRating.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { items, pagination: { page, pageSize, total, totalPages } };
  }

  async getPhraseAudioRatingDetail(
    userId: number,
    id: number,
  ): Promise<GetPhraseAudioRatingDetailResponseDto> {
    const phraseAudioRating = await this.databaseService.phraseAudioRating.findFirst({
      where: { id },
    });
    if (!phraseAudioRating) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return phraseAudioRating;
  }

  async updatePhraseAudioRating(
    userId: number,
    id: number,
    body: UpdatePhraseAudioRatingBodyDto,
  ): Promise<UpdatePhraseAudioRatingResponseDto> {
    const phraseAudioRating = await this.databaseService.phraseAudioRating.findFirst({
      where: { id, userId },
    });
    if (!phraseAudioRating) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phraseAudioRating.update({
      where: { id },
      data: { ...body },
    });
  }

  async deletePhraseAudioRating(userId: number, id: number) {
    const phraseAudioRating = await this.databaseService.phraseAudioRating.findFirst({
      where: { id, userId },
    });
    if (!phraseAudioRating) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phraseAudioRating.delete({ where: { id } });
  }
}
