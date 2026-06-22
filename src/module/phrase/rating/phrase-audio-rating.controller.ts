import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessRole } from 'src/common/enums';
import { RoleBaseAccessControl, SwaggerApiDocument, User } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import {
  CreatePhraseAudioRatingBodyDto,
  CreatePhraseAudioRatingResponseDto,
  GetPhraseAudioRatingDetailResponseDto,
  GetPhraseAudioRatingListQueryDto,
  GetPhraseAudioRatingListResponseDto,
  UpdatePhraseAudioRatingBodyDto,
  UpdatePhraseAudioRatingResponseDto,
} from './dtos';
import { PhraseAudioRatingService } from './phrase-audio-rating.service';

@Controller('phrase-audio-rating')
@ApiTags('Phrase Audio Rating')
@UseGuards(AuthGuard)
@RoleBaseAccessControl(true)
@ApiBearerAuth()
export class PhraseAudioRatingController {
  constructor(private readonly phraseAudioRatingService: PhraseAudioRatingService) {}

  @Post()
  @SwaggerApiDocument({
    response: { type: CreatePhraseAudioRatingResponseDto },
    body: { type: CreatePhraseAudioRatingBodyDto, required: true },
    operation: {
      operationId: `createPhraseAudioRating`,
      summary: `Api createPhraseAudioRating`,
    },
  })
  async createPhraseAudioRating(
    @User('id') userId: number,
    @Body() body: CreatePhraseAudioRatingBodyDto,
  ): Promise<CreatePhraseAudioRatingResponseDto> {
    return this.phraseAudioRatingService.createPhraseAudioRating(userId, body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetPhraseAudioRatingListResponseDto,
    },
    operation: {
      operationId: `getPhraseAudioRatingList`,
      summary: `Api getPhraseAudioRatingList`,
    },
  })
  async getPhraseAudioRatingList(
    @User('id') userId: number,
    @Query() query: GetPhraseAudioRatingListQueryDto,
  ): Promise<GetPhraseAudioRatingListResponseDto> {
    return this.phraseAudioRatingService.getPhraseAudioRatingList(userId, query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: { type: GetPhraseAudioRatingDetailResponseDto },
    operation: {
      operationId: `getPhraseAudioRatingDetail`,
      summary: `Api getPhraseAudioRatingDetail`,
    },
  })
  async getPhraseAudioRatingDetail(
    @User('id') userId: number,
    @Param('id') id: number,
  ): Promise<GetPhraseAudioRatingDetailResponseDto> {
    return this.phraseAudioRatingService.getPhraseAudioRatingDetail(userId, id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: { type: UpdatePhraseAudioRatingResponseDto },
    body: { type: UpdatePhraseAudioRatingBodyDto, required: true },
    operation: {
      operationId: `updatePhraseAudioRating`,
      summary: `Api updatePhraseAudioRating`,
    },
  })
  async updatePhraseAudioRating(
    @User('id') userId: number,
    @Param('id') id: number,
    @Body() body: UpdatePhraseAudioRatingBodyDto,
  ): Promise<UpdatePhraseAudioRatingResponseDto> {
    return this.phraseAudioRatingService.updatePhraseAudioRating(userId, id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: { status: HttpStatus.NO_CONTENT },
    operation: {
      operationId: `deletePhraseAudioRating`,
      summary: `Api deletePhraseAudioRating`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhraseAudioRating(
    @User('id') userId: number,
    @Param('id') id: number,
  ): Promise<void> {
    await this.phraseAudioRatingService.deletePhraseAudioRating(userId, id);
  }
}
