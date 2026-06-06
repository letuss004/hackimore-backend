import { Injectable } from '@nestjs/common';
import { PhraseStatus, Prisma } from '@prisma/client';
import { _ } from '@server/libs/lodash';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
import { CacheService } from 'src/module/base/cache';
import { DatabaseService } from 'src/module/base/database';
import { PHRASE_CACHE } from 'src/module/phrase/phrase.const';
import { RandomSchedule } from 'src/module/phrase/phrase.type';
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
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async createPhrase(
    userId: number,
    body: CreatePhraseBodyDto,
  ): Promise<CreatePhraseResponseDto> {
    return this.databaseService.phrase.create({
      data: { ...body, userId },
    });
  }

  async getPhraseList(
    userId: number,
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
      //
      userId,
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
          description: true,
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

  async getPhraseDetail(userId: number, id: number): Promise<GetPhraseDetailResponseDto> {
    const phrase = await this.databaseService.phrase.findFirst({ where: { id, userId } });
    if (!phrase) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return phrase;
  }

  async updatePhrase(
    userId: number,
    id: number,
    body: UpdatePhraseBodyDto,
  ): Promise<UpdatePhraseResponseDto> {
    const phrase = await this.databaseService.phrase.findFirst({ where: { id, userId } });
    if (!phrase) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phrase.update({
      where: { id },
      data: { ...body },
    });
  }

  async deletePhrase(userId: number, id: number) {
    const phrase = await this.databaseService.phrase.findFirst({ where: { id, userId } });
    if (!phrase) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.phrase.delete({ where: { id } });
  }

  async getRandomPhrase(
    userId: number,
    query: GetRandomPhraseQueryDto,
  ): Promise<GetRandomPhraseResponseDto> {
    const cacheKey = PHRASE_CACHE.RANDOM_SCHEDULE(userId);
    let cacheValue = await this.cacheService.getJsonParsed<RandomSchedule>({
      key: cacheKey,
    });

    if (
      cacheValue?.scheduledIds?.length &&
      _.isEqual(query.language, cacheValue.languages)
    ) {
      const phraseId = cacheValue.scheduledIds.shift();
      await this.cacheService.setStringify({
        key: cacheKey,
        value: {
          scheduledIds: cacheValue.scheduledIds,
          languages: query.language,
        } as RandomSchedule,
        expired: 600, // 10 mins
      });

      return this.databaseService.phrase.update({
        where: { id: phraseId },
        data: { pickedCount: { increment: 1 } },
      });
    }

    const languages = query.language || [];

    // Gap narrowing logic: Pick phrases where pickedCount <= minCount + 5
    const candidates: any[] = await this.databaseService.$queryRaw`
        WITH stats AS (
          SELECT MIN("pickedCount") as min_count
          FROM "Phrase"
          WHERE "userId" = ${userId} AND "status" IN (${PhraseStatus.Active})
          ${
            languages.length > 0
              ? Prisma.sql`AND "language"::text IN (${Prisma.join(languages)})`
              : Prisma.empty
          }
        )
        SELECT id FROM "Phrase", stats
        WHERE "userId" = ${userId} AND "status" IN (${PhraseStatus.Active})
          AND "pickedCount" <= stats.min_count + 5
          ${
            languages.length > 0
              ? Prisma.sql`AND "language"::text IN (${Prisma.join(languages)})`
              : Prisma.empty
          }
        ORDER BY RANDOM()
        LIMIT 10 
      `;

    const scheduledIds = candidates.map((c) => c.id);
    const phraseId = scheduledIds.shift();
    await this.cacheService.setStringify({
      key: cacheKey,
      value: {
        scheduledIds,
        languages: query.language,
      } as RandomSchedule,
      expired: 600, // 10 mins
    });

    return this.databaseService.phrase.update({
      where: { id: phraseId },
      data: { pickedCount: { increment: 1 } },
    });
  }
}
