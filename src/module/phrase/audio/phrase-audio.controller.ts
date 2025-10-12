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
import { PaginationResponseDto } from '@server/platform/dtos';
import { AccessRole } from 'src/common/enums';
import { RoleBaseAccessControl, SwaggerApiDocument } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import {
  CreatePhraseAudioBodyDto,
  CreatePhraseAudioResponseDto,
  GetPhraseAudioDetailResponseDto,
  GetPhraseAudioListQueryDto,
  GetPhraseAudioListResponseDto,
  UpdatePhraseAudioBodyDto,
  UpdatePhraseAudioResponseDto,
} from './dtos';
import { PhraseAudioService } from './phrase-audio.service';

@Controller('phrase-audio')
@ApiTags('Phrase Audio')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([])
@ApiBearerAuth()
export class PhraseAudioController {
  constructor(private readonly phraseAudioService: PhraseAudioService) {}

  @Post()
  @SwaggerApiDocument({
    response: { type: CreatePhraseAudioResponseDto },
    body: { type: CreatePhraseAudioBodyDto, required: true },
    operation: {
      operationId: `createPhraseAudio`,
      summary: `Api createPhraseAudio`,
    },
  })
  async createPhraseAudio(
    @Body() body: CreatePhraseAudioBodyDto,
  ): Promise<CreatePhraseAudioResponseDto> {
    return this.phraseAudioService.createPhraseAudio(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetPhraseAudioListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getPhraseAudioList`,
      summary: `Api getPhraseAudioList`,
    },
  })
  async getPhraseAudioList(
    @Query() query: GetPhraseAudioListQueryDto,
  ): Promise<PaginationResponseDto<GetPhraseAudioListResponseDto>> {
    return this.phraseAudioService.getPhraseAudioList(query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: { type: GetPhraseAudioDetailResponseDto },
    operation: {
      operationId: `getPhraseAudioDetail`,
      summary: `Api getPhraseAudioDetail`,
    },
  })
  async getPhraseAudioDetail(
    @Param('id') id: number,
  ): Promise<GetPhraseAudioDetailResponseDto> {
    return this.phraseAudioService.getPhraseAudioDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: { type: UpdatePhraseAudioResponseDto },
    body: { type: UpdatePhraseAudioBodyDto, required: true },
    operation: {
      operationId: `updatePhraseAudio`,
      summary: `Api updatePhraseAudio`,
    },
  })
  async updatePhraseAudio(
    @Param('id') id: number,
    @Body() body: UpdatePhraseAudioBodyDto,
  ): Promise<UpdatePhraseAudioResponseDto> {
    return this.phraseAudioService.updatePhraseAudio(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: { status: HttpStatus.NO_CONTENT },
    operation: {
      operationId: `deletePhraseAudio`,
      summary: `Api deletePhraseAudio`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhraseAudio(@Param('id') id: number): Promise<void> {
    await this.phraseAudioService.deletePhraseAudio(id);
  }
}
