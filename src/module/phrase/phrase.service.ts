import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
import { DatabaseService } from 'src/module/base/database';
import {
  CreatePhraseBodyDto,
  CreatePhraseResponseDto,
  GetPhraseDetailResponseDto,
  GetPhraseListQueryDto,
  GetPhraseListResponseDto,
  GetRandomPhraseQueryDto,
  GetRandomPhraseResponseDto,
  UpdatePhraseBodyDto,
  UpdatePhraseResponseDto,
} from './dtos';

@Injectable()
export class PhraseService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPhrase(body: CreatePhraseBodyDto): Promise<CreatePhraseResponseDto> {
    return this.databaseService.phrase.create({
      data: { ...body },
    });
  }

  async getPhraseList(
    query: GetPhraseListQueryDto,
  ): Promise<PaginationResponseDto<GetPhraseListResponseDto>> {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.PhraseWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.language && { language: { in: query.language } }),
      ...(query.search && {
        OR: [
          { content: { contains: query.search } },
          { context: { contains: query.search } },
          { description: { contains: query.search } },
        ],
      }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.phrase.findMany({
        where,
        take,
        skip,
        orderBy: parseOrderByFromQuery(query.orderBy),
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
        select: {
          id: true,
          content: true,
          context: true,
          language: true,
          createdAt: true,
        },
      }),
      this.databaseService.phrase.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getPhraseDetail(id: number): Promise<GetPhraseDetailResponseDto> {
    const phrase = await this.databaseService.phrase.findFirst({ where: { id } });
    if (!phrase) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return phrase;
  }

  async updatePhrase(
    id: number,
    body: UpdatePhraseBodyDto,
  ): Promise<UpdatePhraseResponseDto> {
    const phrase = await this.databaseService.phrase.findFirst({ where: { id } });
    if (!phrase) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phrase.update({
      where: { id },
      data: { ...body },
    });
  }

  async deletePhrase(id: number) {
    const phrase = await this.databaseService.phrase.findFirst({ where: { id } });
    if (!phrase) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phrase.delete({ where: { id } });
  }

  async getRandomPhrase(
    userId: number,
    query: GetRandomPhraseQueryDto,
  ): Promise<GetRandomPhraseResponseDto> {
    const result = await this.databaseService.$queryRaw<GetRandomPhraseResponseDto[]>`
      SELECT *
      FROM "Phrase" TABLESAMPLE BERNOULLI(10) -- Adjust percentage to ensure enough rows are sampled
      ORDER BY RANDOM ()
      LIMIT 1;
    `;
    return result[0];
  }
}
