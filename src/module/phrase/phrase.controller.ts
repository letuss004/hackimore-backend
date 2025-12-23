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
  CreatePhraseBodyDto,
  CreatePhraseResponseDto,
  GetPhraseDetailResponseDto,
  GetPhraseListQueryDto,
  GetPhraseListResponseDto,
  GetRandomPhraseResponseDto,
  UpdatePhraseBodyDto,
  UpdatePhraseResponseDto,
} from './dtos';
import { PhraseService } from './phrase.service';

@Controller('phrase')
@ApiTags('Phrase')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class PhraseController {
  constructor(private readonly phraseService: PhraseService) {}

  @Post()
  @SwaggerApiDocument({
    response: { type: CreatePhraseResponseDto },
    body: { type: CreatePhraseBodyDto, required: true },
    operation: {
      operationId: `createPhrase`,
      summary: `Api createPhrase`,
    },
  })
  async createPhrase(
    @Body() body: CreatePhraseBodyDto,
  ): Promise<CreatePhraseResponseDto> {
    return this.phraseService.createPhrase(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetPhraseListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getPhraseList`,
      summary: `Api getPhraseList`,
    },
  })
  async getPhraseList(
    @Query() query: GetPhraseListQueryDto,
  ): Promise<PaginationResponseDto<GetPhraseListResponseDto>> {
    return this.phraseService.getPhraseList(query);
  }

  @Get('random')
  @SwaggerApiDocument({
    response: { type: GetRandomPhraseResponseDto },
    operation: {
      operationId: `getRandomPhrase`,
      summary: `Api getRandomPhrase`,
    },
  })
  async getRandomPhrase(@User('id') userId: number): Promise<GetRandomPhraseResponseDto> {
    return this.phraseService.getRandomPhrase(userId);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: { type: GetPhraseDetailResponseDto },
    operation: {
      operationId: `getPhraseDetail`,
      summary: `Api getPhraseDetail`,
    },
  })
  async getPhraseDetail(@Param('id') id: number): Promise<GetPhraseDetailResponseDto> {
    return this.phraseService.getPhraseDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: { type: UpdatePhraseResponseDto },
    body: { type: UpdatePhraseBodyDto, required: true },
    operation: {
      operationId: `updatePhrase`,
      summary: `Api updatePhrase`,
    },
  })
  async updatePhrase(
    @Param('id') id: number,
    @Body() body: UpdatePhraseBodyDto,
  ): Promise<UpdatePhraseResponseDto> {
    return this.phraseService.updatePhrase(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: { status: HttpStatus.NO_CONTENT },
    operation: {
      operationId: `deletePhrase`,
      summary: `Api deletePhrase`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhrase(@Param('id') id: number): Promise<void> {
    await this.phraseService.deletePhrase(id);
  }
}
