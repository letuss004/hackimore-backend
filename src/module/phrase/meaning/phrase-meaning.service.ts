import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
import { DatabaseService } from 'src/module/base/database';
import {
  CreatePhraseMeaningBodyDto,
  CreatePhraseMeaningResponseDto,
  GetPhraseMeaningDetailResponseDto,
  GetPhraseMeaningListQueryDto,
  GetPhraseMeaningListResponseDto,
  UpdatePhraseMeaningBodyDto,
  UpdatePhraseMeaningResponseDto,
} from './dtos';

@Injectable()
export class PhraseMeaningService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPhraseMeaning(
    body: CreatePhraseMeaningBodyDto,
  ): Promise<CreatePhraseMeaningResponseDto> {
    return this.databaseService.phraseMeaning.create({
      data: { ...body },
    });
  }

  async getPhraseMeaningList(
    query: GetPhraseMeaningListQueryDto,
  ): Promise<PaginationResponseDto<GetPhraseMeaningListResponseDto>> {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.PhraseMeaningWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.key && { key: query.key }),
      ...(query.content && { content: query.content }),
      ...(query.phraseId && { phraseId: query.phraseId }),
      ...(query.language && { language: query.language }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.phraseMeaning.findMany({
        where,
        take,
        skip,
        orderBy: parseOrderByFromQuery(query.orderBy),
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.phraseMeaning.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getPhraseMeaningDetail(id: number): Promise<GetPhraseMeaningDetailResponseDto> {
    const phraseMeaning = await this.databaseService.phraseMeaning.findFirst({
      where: { id },
    });
    if (!phraseMeaning) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return phraseMeaning;
  }

  async updatePhraseMeaning(
    id: number,
    body: UpdatePhraseMeaningBodyDto,
  ): Promise<UpdatePhraseMeaningResponseDto> {
    const phraseMeaning = await this.databaseService.phraseMeaning.findFirst({
      where: { id },
    });
    if (!phraseMeaning) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phraseMeaning.update({
      where: { id },
      data: { ...body },
    });
  }

  async deletePhraseMeaning(id: number) {
    const phraseMeaning = await this.databaseService.phraseMeaning.findFirst({
      where: { id },
    });
    if (!phraseMeaning) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phraseMeaning.delete({ where: { id } });
  }
}
