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
import { RoleBaseAccessControl, SwaggerApiDocument, User } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import {
  CreatePhraseRetryBodyDto,
  CreatePhraseRetryResponseDto,
  GetPhraseRetryDetailResponseDto,
  GetPhraseRetryListQueryDto,
  GetPhraseRetryListResponseDto,
  UpdatePhraseRetryBodyDto,
  UpdatePhraseRetryResponseDto,
} from './dtos';
import { PhraseRetryService } from './phrase-retry.service';

@Controller('phrase-retry')
@ApiTags('Phrase Retry')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class PhraseRetryController {
  constructor(private readonly phraseRetryService: PhraseRetryService) {}

  @Post()
  @SwaggerApiDocument({
    response: { type: CreatePhraseRetryResponseDto },
    body: { type: CreatePhraseRetryBodyDto, required: true },
    operation: {
      operationId: `createPhraseRetry`,
      summary: `Api createPhraseRetry`,
    },
  })
  async createPhraseRetry(
    @User('id') userId: number,
    @Body() body: CreatePhraseRetryBodyDto,
  ): Promise<CreatePhraseRetryResponseDto> {
    return this.phraseRetryService.createPhraseRetry(userId, body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetPhraseRetryListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getPhraseRetryList`,
      summary: `Api getPhraseRetryList`,
    },
  })
  async getPhraseRetryList(
    @User('id') userId: number,
    @Query() query: GetPhraseRetryListQueryDto,
  ): Promise<PaginationResponseDto<GetPhraseRetryListResponseDto>> {
    return this.phraseRetryService.getPhraseRetryList(userId, query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: { type: GetPhraseRetryDetailResponseDto },
    operation: {
      operationId: `getPhraseRetryDetail`,
      summary: `Api getPhraseRetryDetail`,
    },
  })
  async getPhraseRetryDetail(
    @User('id') userId: number,
    @Param('id') id: number,
  ): Promise<GetPhraseRetryDetailResponseDto> {
    return this.phraseRetryService.getPhraseRetryDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: { type: UpdatePhraseRetryResponseDto },
    body: { type: UpdatePhraseRetryBodyDto, required: true },
    operation: {
      operationId: `updatePhraseRetry`,
      summary: `Api updatePhraseRetry`,
    },
  })
  async updatePhraseRetry(
    @User('id') userId: number,
    @Param('id') id: number,
    @Body() body: UpdatePhraseRetryBodyDto,
  ): Promise<UpdatePhraseRetryResponseDto> {
    return this.phraseRetryService.updatePhraseRetry(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: { status: HttpStatus.NO_CONTENT },
    operation: {
      operationId: `deletePhraseRetry`,
      summary: `Api deletePhraseRetry`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhraseRetry(
    @User('id') userId: number,
    @Param('id') id: number,
  ): Promise<void> {
    await this.phraseRetryService.deletePhraseRetry(id);
  }
}
