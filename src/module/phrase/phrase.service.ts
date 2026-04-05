import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { _ } from '@server/libs/lodash';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { getRandomNumber } from 'src/common/helpers/number';
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
    const where: Prisma.PhraseWhereInput = {
      userId,
      ...(query?.language && { language: { in: query.language } }),
    };
    const cacheKey = PHRASE_CACHE.RANDOM_SCHEDULE(userId);

    let randomSchedule = await this.cacheService.getJsonParsed<RandomSchedule>({
      key: cacheKey,
    });
    if (!randomSchedule || _.isEqual(query.language, randomSchedule?.languages)) {
      const count = await this.databaseService.phrase.count({ where });
      randomSchedule = {
        count,
        basePosition: getRandomNumber({ from: 0, to: count }),
        languages: query.language,
        scheduled: [],
      };
    }

    let position: number = 0;
    do {
      const random = getRandomNumber({
        from: -15,
        to: 15,
        exclude: randomSchedule.scheduled,
      });
      position = randomSchedule.basePosition + random;
      randomSchedule.scheduled.push(random);
    } while (position < 0 || position > randomSchedule.count);

    const phrase = await this.databaseService.phrase.findFirst({
      where,
      skip: position,
    });

    if (randomSchedule.scheduled.length >= 5) {
      await this.cacheService.redis.del([cacheKey]);
    } else {
      await this.cacheService.setStringify({
        key: cacheKey,
        value: randomSchedule,
        expired: 300, // 5 mins
      });
    }

    return phrase;
  }
}
