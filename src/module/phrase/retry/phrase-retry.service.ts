import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
import { DatabaseService } from 'src/module/base/database';
import {
  CreatePhraseRetryBodyDto,
  CreatePhraseRetryResponseDto,
  GetPhraseRetryDetailResponseDto,
  GetPhraseRetryListQueryDto,
  GetPhraseRetryListResponseDto,
  UpdatePhraseRetryBodyDto,
  UpdatePhraseRetryResponseDto,
} from './dtos';

@Injectable()
export class PhraseRetryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPhraseRetry(
    userId: number,
    body: CreatePhraseRetryBodyDto,
  ): Promise<CreatePhraseRetryResponseDto> {
    return this.databaseService.phraseRetry.create({
      data: { ...body, userId },
    });
  }

  async getPhraseRetryList(
    userId: number,
    query: GetPhraseRetryListQueryDto,
  ): Promise<PaginationResponseDto<GetPhraseRetryListResponseDto>> {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.PhraseRetryWhereInput = {
      ...(query.id && { id: query.id }),
      userId,
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.phraseRetry.findMany({
        where,
        take,
        skip,
        include: { Phrase: true },
        orderBy: parseOrderByFromQuery(query.orderBy),
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.phraseRetry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getPhraseRetryDetail(id: number): Promise<GetPhraseRetryDetailResponseDto> {
    const phraseRetry = await this.databaseService.phraseRetry.findFirst({
      where: { id },
    });
    if (!phraseRetry) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return phraseRetry;
  }

  async updatePhraseRetry(
    id: number,
    body: UpdatePhraseRetryBodyDto,
  ): Promise<UpdatePhraseRetryResponseDto> {
    const phraseRetry = await this.databaseService.phraseRetry.findFirst({
      where: { id },
    });
    if (!phraseRetry) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phraseRetry.update({
      where: { id },
      data: { ...body },
    });
  }

  async deletePhraseRetry(id: number) {
    const phraseRetry = await this.databaseService.phraseRetry.findFirst({
      where: { id },
    });
    if (!phraseRetry) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phraseRetry.delete({ where: { id } });
  }
}
