import { Languages, PhraseStatus } from '@prisma/client';
import { PropertyDto } from 'src/decorator';

// ****************************** Summary ******************************

export class GetPhraseSummaryQueryDto {
  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeStart: Date;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeEnd: Date;
}

export class PhraseSummaryStatusBreakdownDto {
  @PropertyDto() Active: number;
  @PropertyDto() Master: number;
  @PropertyDto() Deferred: number;
}

export class PhraseSummaryLanguageBreakdownDto {
  @PropertyDto() English: number;
  @PropertyDto() Vietnamese: number;
  @PropertyDto() Chinese: number;
  @PropertyDto() unknown: number;
}

export class GetPhraseSummaryResponseDto {
  @PropertyDto() totalPhrases: number;

  @PropertyDto({ type: PhraseSummaryStatusBreakdownDto, structure: 'dto' })
  totalByStatus: PhraseSummaryStatusBreakdownDto;

  @PropertyDto({ type: PhraseSummaryLanguageBreakdownDto, structure: 'dto' })
  totalByLanguage: PhraseSummaryLanguageBreakdownDto;

  @PropertyDto() totalAudios: number;
  @PropertyDto() avgAudioPerPhrase: number;
  @PropertyDto() avgRating: number;
}

// ****************************** Pick Distribution ******************************

export class GetPickDistributionQueryDto {
  @PropertyDto({ type: Languages, required: false, validated: true, structure: 'enum' })
  language: Languages;

  @PropertyDto({
    type: PhraseStatus,
    required: false,
    validated: true,
    structure: 'enum',
  })
  status: PhraseStatus;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeStart: Date;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeEnd: Date;
}

export class PickBucketDto {
  @PropertyDto() range: string;
  @PropertyDto() count: number;
}

export class TopPickedPhraseDto {
  @PropertyDto() id: number;
  @PropertyDto() content: string;
  @PropertyDto() language: string;
  @PropertyDto() status: string;
  @PropertyDto() pickedCount: number;
}

export class GetPickDistributionResponseDto {
  @PropertyDto({ type: PickBucketDto, structure: 'dtoArray' })
  buckets: PickBucketDto[];

  @PropertyDto({ type: TopPickedPhraseDto, structure: 'dtoArray' })
  topPickedPhrases: TopPickedPhraseDto[];

  @PropertyDto({ type: TopPickedPhraseDto, structure: 'dtoArray' })
  leastPickedPhrases: TopPickedPhraseDto[];

  @PropertyDto() neverPickedCount: number;
}

// ****************************** By Status ******************************

export class GetPhraseByStatusQueryDto {
  @PropertyDto({ type: Languages, required: false, validated: true, structure: 'enum' })
  language: Languages;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeStart: Date;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeEnd: Date;
}

export class PhraseStatusBreakdownItemDto {
  @PropertyDto() status: string;
  @PropertyDto() count: number;
  @PropertyDto() percentage: number;
  @PropertyDto() avgPickedCount: number;
  @PropertyDto() avgAudioCount: number;
  @PropertyDto() avgRating: number;
}

export class GetPhraseByStatusResponseDto {
  @PropertyDto({ type: PhraseStatusBreakdownItemDto, structure: 'dtoArray' })
  data: PhraseStatusBreakdownItemDto[];
}

// ****************************** By Language ******************************

export class GetPhraseByLanguageQueryDto {
  @PropertyDto({
    type: PhraseStatus,
    required: false,
    validated: true,
    structure: 'enum',
  })
  status: PhraseStatus;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeStart: Date;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeEnd: Date;
}

export class PhraseLanguageBreakdownItemDto {
  @PropertyDto() language: string;
  @PropertyDto() count: number;
  @PropertyDto() percentage: number;
  @PropertyDto() avgPickedCount: number;
  @PropertyDto() totalAudios: number;
  @PropertyDto() avgRating: number;
}

export class GetPhraseByLanguageResponseDto {
  @PropertyDto({ type: PhraseLanguageBreakdownItemDto, structure: 'dtoArray' })
  data: PhraseLanguageBreakdownItemDto[];
}

// ****************************** Audio Rating ******************************

export class GetAudioRatingQueryDto {
  @PropertyDto({ type: Number, required: false, validated: true })
  phraseId: number;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeStart: Date;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeEnd: Date;
}

export class AudioRatingOverallDto {
  @PropertyDto() avgRating: number;
  @PropertyDto() minRating: number;
  @PropertyDto() maxRating: number;
  @PropertyDto() totalRated: number;
  @PropertyDto() totalUnrated: number;
}

export class AudioRatingDistributionItemDto {
  @PropertyDto() rating: number;
  @PropertyDto() count: number;
  @PropertyDto() percentage: number;
}

export class AudioRatingByLanguageItemDto {
  @PropertyDto() language: string;
  @PropertyDto() avgRating: number;
  @PropertyDto() count: number;
}

export class AudioRatingPhraseItemDto {
  @PropertyDto() phraseId: number;
  @PropertyDto() content: string;
  @PropertyDto() avgRating: number;
  @PropertyDto() audioCount: number;
}

export class GetAudioRatingResponseDto {
  @PropertyDto({ type: AudioRatingOverallDto, structure: 'dto' })
  overall: AudioRatingOverallDto;

  @PropertyDto({ type: AudioRatingDistributionItemDto, structure: 'dtoArray' })
  ratingDistribution: AudioRatingDistributionItemDto[];

  @PropertyDto({ type: AudioRatingByLanguageItemDto, structure: 'dtoArray' })
  byLanguage: AudioRatingByLanguageItemDto[];

  @PropertyDto({ type: AudioRatingPhraseItemDto, structure: 'dtoArray' })
  highRatedPhrases: AudioRatingPhraseItemDto[];

  @PropertyDto({ type: AudioRatingPhraseItemDto, structure: 'dtoArray' })
  lowRatedPhrases: AudioRatingPhraseItemDto[];
}

// ****************************** Timeline ******************************

export class GetPhraseTimelineQueryDto {
  @PropertyDto({
    type: String,
    required: false,
    validated: true,
    description: `Granularity of the timeline. Accepted values: 'day' | 'week' | 'month'. Default: 'day'`,
  })
  granularity: string;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeStart: Date;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeEnd: Date;
}

export class TimelineDataPointDto {
  @PropertyDto() period: string;
  @PropertyDto() count: number;
  @PropertyDto() cumulative: number;
}

export class GetPhraseTimelineResponseDto {
  @PropertyDto({ type: TimelineDataPointDto, structure: 'dtoArray' })
  phrases: TimelineDataPointDto[];

  @PropertyDto({ type: TimelineDataPointDto, structure: 'dtoArray' })
  audios: TimelineDataPointDto[];
}

// ****************************** Audio Coverage ******************************

export class GetAudioCoverageQueryDto {
  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeStart: Date;

  @PropertyDto({ type: Date, required: false, validated: true })
  createdAtRangeEnd: Date;
}

export class AudioCoverageByGroupItemDto {
  @PropertyDto() group: string;
  @PropertyDto() total: number;
  @PropertyDto() withAudio: number;
  @PropertyDto() withoutAudio: number;
  @PropertyDto() coverageRate: number;
}

export class CoverageTopPhraseDto {
  @PropertyDto() phraseId: number;
  @PropertyDto() content: string;
  @PropertyDto() audioCount: number;
}

export class GetAudioCoverageResponseDto {
  @PropertyDto() withAudio: number;
  @PropertyDto() withoutAudio: number;
  @PropertyDto() coverageRate: number;
  @PropertyDto() avgAudioPerCoveredPhrase: number;

  @PropertyDto({ type: AudioCoverageByGroupItemDto, structure: 'dtoArray' })
  byLanguage: AudioCoverageByGroupItemDto[];

  @PropertyDto({ type: AudioCoverageByGroupItemDto, structure: 'dtoArray' })
  byStatus: AudioCoverageByGroupItemDto[];

  @PropertyDto({ type: CoverageTopPhraseDto, structure: 'dtoArray' })
  phrasesWithMostAudio: CoverageTopPhraseDto[];
}

// ****************************** Pick Level ******************************

export class GetPickLevelQueryDto {
  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
    description: `Start of pickedCount range (inclusive). Default: 1`,
  })
  from: number;

  @PropertyDto({
    type: Number,
    required: false,
    validated: true,
    description: `End of pickedCount range (inclusive). Default: 5`,
  })
  to: number;

  @PropertyDto({
    type: Languages,
    required: false,
    validated: true,
    structure: 'enumArray',
    description: `Filter by one or more languages. Omit to get totals across all languages.`,
  })
  language: Languages[];
}

export class PickLevelItemDto {
  @PropertyDto() pickedCount: number;
  @PropertyDto() count: number;
}

export class GetPickLevelResponseDto {
  @PropertyDto({ type: PickLevelItemDto, structure: 'dtoArray' })
  data: PickLevelItemDto[];
}
