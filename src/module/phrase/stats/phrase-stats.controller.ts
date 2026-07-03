import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleBaseAccessControl, SwaggerApiDocument, User } from 'src/decorator';
import { AuthGuard } from 'src/guard';
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
import { PhraseStatsService } from './phrase-stats.service';

@Controller('phrase-stats')
@ApiTags('Phrase Stats')
@UseGuards(AuthGuard)
@RoleBaseAccessControl(true)
@ApiBearerAuth()
export class PhraseStatsController {
  constructor(private readonly phraseStatsService: PhraseStatsService) {}

  @Get('summary')
  @SwaggerApiDocument({
    response: { type: GetPhraseSummaryResponseDto },
    operation: {
      operationId: `getPhraseSummary`,
      summary: `Api getPhraseSummary`,
      description: `
        <p>Returns an overall statistics snapshot for the current user.</p>
        <ul>
          <li>Total phrase count</li>
          <li>
            Breakdown by status:
            <b>Active</b>, <b>Master</b>, <b>Deferred</b>
          </li>
          <li>
            Breakdown by language:
            <b>English</b>, <b>Vietnamese</b>,
            <b>Chinese</b>, <b>unknown</b>
          </li>
          <li>Total audio count</li>
          <li>Average audios per phrase</li>
          <li>Average audio rating</li>
        </ul>
      `,
    },
  })
  async getPhraseSummary(
    @User('id') userId: number,
    @Query() query: GetPhraseSummaryQueryDto,
  ): Promise<GetPhraseSummaryResponseDto> {
    return this.phraseStatsService.getSummary(userId, query);
  }

  @Get('pick-distribution')
  @SwaggerApiDocument({
    response: { type: GetPickDistributionResponseDto },
    operation: {
      operationId: `getPickDistribution`,
      summary: `Api getPickDistribution`,
      description: `
        <p>
          Analyzes the distribution of <b>pickedCount</b>
          across phrases.
        </p>
        <ul>
          <li>
            Count per bucket:
            <b>0</b>, <b>1–5</b>, <b>6–10</b>,
            <b>11–20</b>, <b>21+</b>
          </li>
          <li>Top 10 most-picked phrases</li>
          <li>
            Top 10 least-picked phrases
            (pickedCount &gt; 0)
          </li>
          <li>Total phrases never picked</li>
        </ul>
        <p>
          Supports optional filtering by
          <b>language</b> and <b>status</b>.
        </p>
      `,
    },
  })
  async getPickDistribution(
    @User('id') userId: number,
    @Query() query: GetPickDistributionQueryDto,
  ): Promise<GetPickDistributionResponseDto> {
    return this.phraseStatsService.getPickDistribution(userId, query);
  }

  @Get('by-status')
  @SwaggerApiDocument({
    response: { type: GetPhraseByStatusResponseDto },
    operation: {
      operationId: `getPhraseByStatus`,
      summary: `Api getPhraseByStatus`,
      description: `
        <p>
          Returns phrase statistics grouped by
          <b>status</b>
          (Active, Master, Deferred).
        </p>
        <p>Each group includes:</p>
        <ul>
          <li>Count &amp; percentage of total</li>
          <li>Average <b>pickedCount</b></li>
          <li>Average audio count per phrase</li>
          <li>Average audio rating</li>
        </ul>
        <p>
          Supports optional filtering by
          <b>language</b> and <b>date range</b>.
        </p>
      `,
    },
  })
  async getPhraseByStatus(
    @User('id') userId: number,
    @Query() query: GetPhraseByStatusQueryDto,
  ): Promise<GetPhraseByStatusResponseDto> {
    return this.phraseStatsService.getPhraseByStatus(userId, query);
  }

  @Get('by-language')
  @SwaggerApiDocument({
    response: { type: GetPhraseByLanguageResponseDto },
    operation: {
      operationId: `getPhraseByLanguage`,
      summary: `Api getPhraseByLanguage`,
      description: `
        <p>
          Returns phrase statistics grouped by
          <b>language</b>
          (English, Vietnamese, Chinese, unknown).
        </p>
        <p>Each group includes:</p>
        <ul>
          <li>Count &amp; percentage of total</li>
          <li>Average <b>pickedCount</b></li>
          <li>Total audio count</li>
          <li>Average audio rating</li>
        </ul>
        <p>
          Supports optional filtering by
          <b>status</b> and <b>date range</b>.
        </p>
      `,
    },
  })
  async getPhraseByLanguage(
    @User('id') userId: number,
    @Query() query: GetPhraseByLanguageQueryDto,
  ): Promise<GetPhraseByLanguageResponseDto> {
    return this.phraseStatsService.getPhraseByLanguage(userId, query);
  }

  @Get('audio-rating')
  @SwaggerApiDocument({
    response: { type: GetAudioRatingResponseDto },
    operation: {
      operationId: `getAudioRating`,
      summary: `Api getAudioRating`,
      description: `
        <p>
          Analyzes audio quality based on the
          <b>rating</b> field (1–10).
        </p>
        <ul>
          <li>
            Overall stats: avg / min / max rating,
            total rated vs unrated
          </li>
          <li>Rating distribution from 1 to 10</li>
          <li>
            Average rating broken down by
            phrase language
          </li>
          <li>
            Top 10 highest-rated phrases
          </li>
          <li>
            Top 10 lowest-rated phrases
          </li>
        </ul>
        <p>
          Supports optional filtering by
          <b>phraseId</b> and <b>date range</b>.
        </p>
      `,
    },
  })
  async getAudioRating(
    @User('id') userId: number,
    @Query() query: GetAudioRatingQueryDto,
  ): Promise<GetAudioRatingResponseDto> {
    return this.phraseStatsService.getAudioRating(userId, query);
  }

  @Get('timeline')
  @SwaggerApiDocument({
    response: { type: GetPhraseTimelineResponseDto },
    operation: {
      operationId: `getPhraseTimeline`,
      summary: `Api getPhraseTimeline`,
      description: `
        <p>
          Returns a creation timeline for phrases
          and audios over time.
        </p>
        <p>
          Supported granularity values:
          <b>'day'</b> (default),
          <b>'week'</b>,
          <b>'month'</b>.
        </p>
        <p>Each data point includes:</p>
        <ul>
          <li>
            <b>count</b> — new items in that period
          </li>
          <li>
            <b>cumulative</b> — running total
          </li>
        </ul>
        <p>
          Supports optional filtering by
          <b>date range</b>.
        </p>
      `,
    },
  })
  async getPhraseTimeline(
    @User('id') userId: number,
    @Query() query: GetPhraseTimelineQueryDto,
  ): Promise<GetPhraseTimelineResponseDto> {
    return this.phraseStatsService.getTimeline(userId, query);
  }

  @Get('audio-coverage')
  @SwaggerApiDocument({
    response: { type: GetAudioCoverageResponseDto },
    operation: {
      operationId: `getAudioCoverage`,
      summary: `Api getAudioCoverage`,
      description: `
        <p>
          Measures audio coverage across phrases.
        </p>
        <ul>
          <li>
            Phrases with at least one audio
            vs phrases with none
          </li>
          <li>Overall coverage rate (%)</li>
          <li>
            Average audios per covered phrase
          </li>
          <li>
            Coverage breakdown by
            <b>language</b> and <b>status</b>
          </li>
          <li>
            Top 10 phrases with the most audios
          </li>
        </ul>
      `,
    },
  })
  async getAudioCoverage(
    @User('id') userId: number,
    @Query() query: GetAudioCoverageQueryDto,
  ): Promise<GetAudioCoverageResponseDto> {
    return this.phraseStatsService.getAudioCoverage(userId, query);
  }

  @Get('pick-level')
  @SwaggerApiDocument({
    response: { type: GetPickLevelResponseDto },
    operation: {
      operationId: `getPickLevel`,
      summary: `Api getPickLevel`,
      description: `
        <p>
          Returns the phrase count for each
          <b>pickedCount</b> level within
          the range [<b>from</b>, <b>to</b>]
          (defaults to 1–5).
        </p>
        <p>
          Always returns the full set of levels,
          including levels with no phrases
          (<b>count = 0</b>).
        </p>
        <p>
          Supports optional filtering by one
          or more <b>languages</b>.
        </p>
      `,
    },
  })
  async getPickLevel(
    @User('id') userId: number,
    @Query() query: GetPickLevelQueryDto,
  ): Promise<GetPickLevelResponseDto> {
    return this.phraseStatsService.getPickLevel(userId, query);
  }
}
