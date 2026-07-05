import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/module/base/database';
import {
  GetAudioCoverageQueryDto,
  GetAudioCoverageResponseDto,
  GetAudioRatingQueryDto,
  GetAudioRatingResponseDto,
  GetPhraseByLanguageQueryDto,
  GetPhraseByLanguageResponseDto,
  GetPhraseByStatusQueryDto,
  GetPhraseByStatusResponseDto,
  GetPhraseSummaryQueryDto,
  GetPhraseSummaryResponseDto,
  GetPhraseTimelineQueryDto,
  GetPhraseTimelineResponseDto,
  GetPickDistributionQueryDto,
  GetPickDistributionResponseDto,
  GetPickLevelQueryDto,
  GetPickLevelResponseDto,
} from './dtos';

@Injectable()
export class PhraseStatsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getPhraseSummary(
    userId: number,
    query: GetPhraseSummaryQueryDto,
  ): Promise<GetPhraseSummaryResponseDto> {
    const phraseWhere: Prisma.PhraseWhereInput = { userId };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      phraseWhere.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const audioWhere: Prisma.PhraseAudioWhereInput = { Pharse: { userId } };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      audioWhere.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [totalPhrases, statusGroups, languageGroups, totalAudios, audioAggregates] =
      await Promise.all([
        this.databaseService.phrase.count({ where: phraseWhere }),
        this.databaseService.phrase.groupBy({
          by: ['status'],
          where: phraseWhere,
          _count: { id: true },
        }),
        this.databaseService.phrase.groupBy({
          by: ['language'],
          where: phraseWhere,
          _count: { id: true },
        }),
        this.databaseService.phraseAudio.count({ where: audioWhere }),
        this.databaseService.phraseAudio.aggregate({
          where: { ...audioWhere, rating: { not: null } },
          _avg: { rating: true },
        }),
      ]);

    const getStatusCount = (s: string) =>
      statusGroups.find((g) => g.status === s)?._count.id ?? 0;

    const getLangCount = (l: string | null) =>
      languageGroups.find((g) => g.language === l)?._count.id ?? 0;

    return {
      totalPhrases,
      totalByStatus: {
        Active: getStatusCount('Active'),
        Master: getStatusCount('Master'),
        Deferred: getStatusCount('Deferred'),
      },
      totalByLanguage: {
        English: getLangCount('English'),
        Vietnamese: getLangCount('Vietnamese'),
        Chinese: getLangCount('Chinese'),
        unknown: getLangCount(null),
      },
      totalAudios,
      avgAudioPerPhrase: totalPhrases > 0 ? totalAudios / totalPhrases : 0,
      avgRating: audioAggregates._avg.rating ?? 0,
    };
  }

  async getPickDistribution(
    userId: number,
    query: GetPickDistributionQueryDto,
  ): Promise<GetPickDistributionResponseDto> {
    const where: Prisma.PhraseWhereInput = {
      userId,
      ...(query.language && { language: query.language }),
      ...(query.status && { status: query.status }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [allPhrases, neverPickedCount, topPickedPhrases, leastPickedPhrases] =
      await Promise.all([
        this.databaseService.phrase.findMany({
          where,
          select: { pickedCount: true },
        }),
        this.databaseService.phrase.count({ where: { ...where, pickedCount: 0 } }),
        this.databaseService.phrase.findMany({
          where: { ...where, pickedCount: { gt: 0 } },
          orderBy: { pickedCount: 'desc' },
          take: 10,
          select: {
            id: true,
            content: true,
            language: true,
            status: true,
            pickedCount: true,
          },
        }),
        this.databaseService.phrase.findMany({
          where: { ...where, pickedCount: { gt: 0 } },
          orderBy: { pickedCount: 'asc' },
          take: 10,
          select: {
            id: true,
            content: true,
            language: true,
            status: true,
            pickedCount: true,
          },
        }),
      ]);

    const bucketRanges = [
      { range: '0', min: 0, max: 0 },
      { range: '1-5', min: 1, max: 5 },
      { range: '6-10', min: 6, max: 10 },
      { range: '11-20', min: 11, max: 20 },
      { range: '21+', min: 21, max: Infinity },
    ];

    const buckets = bucketRanges.map(({ range, min, max }) => ({
      range,
      count: allPhrases.filter((p) => p.pickedCount >= min && p.pickedCount <= max)
        .length,
    }));

    return {
      buckets,
      topPickedPhrases: topPickedPhrases.map((p) => ({
        ...p,
        language: p.language ?? 'unknown',
        status: p.status ?? 'unknown',
      })),
      leastPickedPhrases: leastPickedPhrases.map((p) => ({
        ...p,
        language: p.language ?? 'unknown',
        status: p.status ?? 'unknown',
      })),
      neverPickedCount,
    };
  }

  async getPhraseByStatus(
    userId: number,
    query: GetPhraseByStatusQueryDto,
  ): Promise<GetPhraseByStatusResponseDto> {
    const baseWhere: Prisma.PhraseWhereInput = {
      userId,
      ...(query.language && { language: query.language }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      baseWhere.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [statusGroups, totalCount] = await Promise.all([
      this.databaseService.phrase.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { id: true },
        _avg: { pickedCount: true },
      }),
      this.databaseService.phrase.count({ where: baseWhere }),
    ]);

    const data = await Promise.all(
      statusGroups.map(async (g) => {
        const audioAgg = await this.databaseService.phraseAudio.aggregate({
          where: { Pharse: { ...baseWhere, status: g.status } },
          _avg: { rating: true },
          _count: { id: true },
        });

        const phraseCount = g._count.id;
        return {
          status: g.status ?? 'unknown',
          count: phraseCount,
          percentage: totalCount > 0 ? (phraseCount / totalCount) * 100 : 0,
          avgPickedCount: g._avg.pickedCount ?? 0,
          avgAudioCount: phraseCount > 0 ? audioAgg._count.id / phraseCount : 0,
          avgRating: audioAgg._avg.rating ?? 0,
        };
      }),
    );

    return { data };
  }

  async getPhraseByLanguage(
    userId: number,
    query: GetPhraseByLanguageQueryDto,
  ): Promise<GetPhraseByLanguageResponseDto> {
    const baseWhere: Prisma.PhraseWhereInput = {
      userId,
      ...(query.status && { status: query.status }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      baseWhere.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [languageGroups, totalCount] = await Promise.all([
      this.databaseService.phrase.groupBy({
        by: ['language'],
        where: baseWhere,
        _count: { id: true },
        _avg: { pickedCount: true },
      }),
      this.databaseService.phrase.count({ where: baseWhere }),
    ]);

    const data = await Promise.all(
      languageGroups.map(async (g) => {
        const audioAgg = await this.databaseService.phraseAudio.aggregate({
          where: { Pharse: { ...baseWhere, language: g.language } },
          _avg: { rating: true },
          _count: { id: true },
        });

        return {
          language: g.language ?? 'unknown',
          count: g._count.id,
          percentage: totalCount > 0 ? (g._count.id / totalCount) * 100 : 0,
          avgPickedCount: g._avg.pickedCount ?? 0,
          totalAudios: audioAgg._count.id,
          avgRating: audioAgg._avg.rating ?? 0,
        };
      }),
    );

    return { data };
  }

  async getAudioRating(
    userId: number,
    query: GetAudioRatingQueryDto,
  ): Promise<GetAudioRatingResponseDto> {
    const audioWhere: Prisma.PhraseAudioWhereInput = {
      Pharse: { userId },
      ...(query.phraseId && { phraseId: query.phraseId }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      audioWhere.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [overallAgg, totalRated, totalUnrated] = await Promise.all([
      this.databaseService.phraseAudio.aggregate({
        where: { ...audioWhere, rating: { not: null } },
        _avg: { rating: true },
        _min: { rating: true },
        _max: { rating: true },
      }),
      this.databaseService.phraseAudio.count({
        where: { ...audioWhere, rating: { not: null } },
      }),
      this.databaseService.phraseAudio.count({
        where: { ...audioWhere, rating: null },
      }),
    ]);

    const distributionRaw: Array<{ rating: number; count: bigint }> = await this
      .databaseService.$queryRaw`
        SELECT pa.rating, COUNT(*) as count
        FROM "PhraseAudio" pa
        JOIN "Phrase" p ON p.id = pa."phraseId"
        WHERE pa.rating IS NOT NULL
          ${Prisma.sql`AND p."userId" = ${userId}`}
          ${query.phraseId ? Prisma.sql`AND pa."phraseId" = ${query.phraseId}` : Prisma.empty}
        GROUP BY pa.rating
        ORDER BY pa.rating ASC
      `;

    const ratingDistribution = Array.from({ length: 10 }, (_, i) => {
      const r = i + 1;
      const found = distributionRaw.find((d) => d.rating === r);
      const count = found ? Number(found.count) : 0;
      return {
        rating: r,
        count,
        percentage: totalRated > 0 ? (count / totalRated) * 100 : 0,
      };
    });

    const byLanguageRaw: Array<{
      language: string | null;
      avg_rating: number;
      count: bigint;
    }> = await this.databaseService.$queryRaw`
        SELECT p."language", AVG(pa.rating) as avg_rating, COUNT(pa.id) as count
        FROM "PhraseAudio" pa
        JOIN "Phrase" p ON p.id = pa."phraseId"
        WHERE pa.rating IS NOT NULL
          ${Prisma.sql`AND p."userId" = ${userId}`}
        GROUP BY p."language"
      `;

    const highRatedRaw: Array<{
      phraseId: number;
      content: string;
      avg_rating: number;
      audio_count: bigint;
    }> = await this.databaseService.$queryRaw`
        SELECT pa."phraseId", p.content, AVG(pa.rating) as avg_rating, COUNT(pa.id) as audio_count
        FROM "PhraseAudio" pa
        JOIN "Phrase" p ON p.id = pa."phraseId"
        WHERE pa.rating IS NOT NULL
          ${Prisma.sql`AND p."userId" = ${userId}`}
        GROUP BY pa."phraseId", p.content
        ORDER BY avg_rating DESC
        LIMIT 10
      `;

    const lowRatedRaw: Array<{
      phraseId: number;
      content: string;
      avg_rating: number;
      audio_count: bigint;
    }> = await this.databaseService.$queryRaw`
        SELECT pa."phraseId", p.content, AVG(pa.rating) as avg_rating, COUNT(pa.id) as audio_count
        FROM "PhraseAudio" pa
        JOIN "Phrase" p ON p.id = pa."phraseId"
        WHERE pa.rating IS NOT NULL
          ${Prisma.sql`AND p."userId" = ${userId}`}
        GROUP BY pa."phraseId", p.content
        ORDER BY avg_rating ASC
        LIMIT 10
      `;

    const mapRatedPhrase = (r: (typeof highRatedRaw)[0]) => ({
      phraseId: r.phraseId,
      content: r.content,
      avgRating: Number(r.avg_rating),
      audioCount: Number(r.audio_count),
    });

    return {
      overall: {
        avgRating: overallAgg._avg.rating ?? 0,
        minRating: overallAgg._min.rating ?? 0,
        maxRating: overallAgg._max.rating ?? 0,
        totalRated,
        totalUnrated,
      },
      ratingDistribution,
      byLanguage: byLanguageRaw.map((r) => ({
        language: r.language ?? 'unknown',
        avgRating: Number(r.avg_rating),
        count: Number(r.count),
      })),
      highRatedPhrases: highRatedRaw.map(mapRatedPhrase),
      lowRatedPhrases: lowRatedRaw.map(mapRatedPhrase),
    };
  }

  async getPhraseTimeline(
    userId: number,
    query: GetPhraseTimelineQueryDto,
  ): Promise<GetPhraseTimelineResponseDto> {
    const granularity = query.granularity ?? 'day';
    const dateTrunc =
      granularity === 'month'
        ? Prisma.sql`'month'`
        : granularity === 'week'
          ? Prisma.sql`'week'`
          : Prisma.sql`'day'`;

    const phraseRaw: Array<{ period: Date; count: bigint }> = await this.databaseService
      .$queryRaw`
        SELECT DATE_TRUNC(${dateTrunc}, "createdAt") as period, COUNT(*) as count
        FROM "Phrase"
        WHERE TRUE
          ${Prisma.sql`AND "userId" = ${userId}`}
          ${query.createdAtRangeStart ? Prisma.sql`AND "createdAt" >= ${query.createdAtRangeStart}` : Prisma.empty}
          ${query.createdAtRangeEnd ? Prisma.sql`AND "createdAt" <= ${query.createdAtRangeEnd}` : Prisma.empty}
        GROUP BY period
        ORDER BY period ASC
      `;

    const audioRaw: Array<{ period: Date; count: bigint }> = await this.databaseService
      .$queryRaw`
        SELECT DATE_TRUNC(${dateTrunc}, pa."createdAt") as period, COUNT(*) as count
        FROM "PhraseAudio" pa
        JOIN "Phrase" p ON p.id = pa."phraseId"
        WHERE TRUE
          ${Prisma.sql`AND p."userId" = ${userId}`}
          ${query.createdAtRangeStart ? Prisma.sql`AND pa."createdAt" >= ${query.createdAtRangeStart}` : Prisma.empty}
          ${query.createdAtRangeEnd ? Prisma.sql`AND pa."createdAt" <= ${query.createdAtRangeEnd}` : Prisma.empty}
        GROUP BY period
        ORDER BY period ASC
      `;

    const buildTimeline = (raw: Array<{ period: Date; count: bigint }>) => {
      let cumulative = 0;
      return raw.map((r) => {
        cumulative += Number(r.count);
        return {
          period: r.period.toISOString(),
          count: Number(r.count),
          cumulative,
        };
      });
    };

    return {
      phrases: buildTimeline(phraseRaw),
      audios: buildTimeline(audioRaw),
    };
  }

  async getAudioCoverage(
    userId: number,
    query: GetAudioCoverageQueryDto,
  ): Promise<GetAudioCoverageResponseDto> {
    const phraseWhere: Prisma.PhraseWhereInput = { userId };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      phraseWhere.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [
      totalPhrases,
      withAudioCount,
      totalAudiosForCovered,
      topPhrasesRaw,
      byLanguageRaw,
      byStatusRaw,
    ] = await Promise.all([
      this.databaseService.phrase.count({ where: phraseWhere }),
      this.databaseService.phrase.count({
        where: { ...phraseWhere, PhraseAudio: { some: {} } },
      }),
      this.databaseService.phraseAudio.count({
        where: { Pharse: { ...phraseWhere } },
      }),
      this.databaseService.$queryRaw<
        Array<{ phraseId: number; content: string; audio_count: bigint }>
      >`
          SELECT p.id as "phraseId", p.content, COUNT(pa.id) as audio_count
          FROM "Phrase" p
          LEFT JOIN "PhraseAudio" pa ON pa."phraseId" = p.id
          WHERE TRUE
            ${Prisma.sql`AND p."userId" = ${userId}`}
          GROUP BY p.id, p.content
          ORDER BY audio_count DESC
          LIMIT 10
        `,
      this.databaseService.$queryRaw<
        Array<{ language: string | null; total: bigint; with_audio: bigint }>
      >`
          SELECT p."language",
                 COUNT(DISTINCT p.id) as total,
                 COUNT(DISTINCT pa."phraseId") as with_audio
          FROM "Phrase" p
          LEFT JOIN "PhraseAudio" pa ON pa."phraseId" = p.id
          WHERE TRUE
            ${Prisma.sql`AND p."userId" = ${userId}`}
          GROUP BY p."language"
        `,
      this.databaseService.$queryRaw<
        Array<{ status: string | null; total: bigint; with_audio: bigint }>
      >`
          SELECT p."status",
                 COUNT(DISTINCT p.id) as total,
                 COUNT(DISTINCT pa."phraseId") as with_audio
          FROM "Phrase" p
          LEFT JOIN "PhraseAudio" pa ON pa."phraseId" = p.id
          WHERE TRUE
            ${Prisma.sql`AND p."userId" = ${userId}`}
          GROUP BY p."status"
        `,
    ]);

    const withoutAudio = totalPhrases - withAudioCount;
    const coverageRate = totalPhrases > 0 ? (withAudioCount / totalPhrases) * 100 : 0;
    const avgAudioPerCoveredPhrase =
      withAudioCount > 0 ? totalAudiosForCovered / withAudioCount : 0;

    const mapGroupItem = (group: string | null, total: bigint, withAudio: bigint) => {
      const t = Number(total);
      const w = Number(withAudio);
      return {
        group: group ?? 'unknown',
        total: t,
        withAudio: w,
        withoutAudio: t - w,
        coverageRate: t > 0 ? (w / t) * 100 : 0,
      };
    };

    return {
      withAudio: withAudioCount,
      withoutAudio,
      coverageRate,
      avgAudioPerCoveredPhrase,
      byLanguage: byLanguageRaw.map((r) =>
        mapGroupItem(r.language, r.total, r.with_audio),
      ),
      byStatus: byStatusRaw.map((r) => mapGroupItem(r.status, r.total, r.with_audio)),
      phrasesWithMostAudio: topPhrasesRaw.map((r) => ({
        phraseId: r.phraseId,
        content: r.content,
        audioCount: Number(r.audio_count),
      })),
    };
  }

  async getPickLevel(
    userId: number,
    query: GetPickLevelQueryDto,
  ): Promise<GetPickLevelResponseDto> {
    const from = query.from ?? 1;
    const to = query.to ?? 5;

    const where: Prisma.PhraseWhereInput = {
      userId,
      pickedCount: { gte: from, lte: to },
      ...(query.language?.length && { language: { in: query.language } }),
    };

    const groups = await this.databaseService.phrase.groupBy({
      by: ['pickedCount'],
      where,
      _count: { id: true },
      orderBy: { pickedCount: 'asc' },
    });

    const data = Array.from({ length: to - from + 1 }, (_, i) => {
      const level = from + i;
      return {
        pickedCount: level,
        count: groups.find((g) => g.pickedCount === level)?._count.id ?? 0,
      };
    });

    return { data };
  }
}
