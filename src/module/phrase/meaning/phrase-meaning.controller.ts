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
  CreatePhraseMeaningBodyDto,
  CreatePhraseMeaningResponseDto,
  GetPhraseMeaningDetailResponseDto,
  GetPhraseMeaningListQueryDto,
  GetPhraseMeaningListResponseDto,
  UpdatePhraseMeaningBodyDto,
  UpdatePhraseMeaningResponseDto,
} from './dtos';
import { PhraseMeaningService } from './phrase-meaning.service';

@Controller('phrase-meaning')
@ApiTags('Phrase Meaning')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([])
@ApiBearerAuth()
export class PhraseMeaningController {
  constructor(private readonly phraseMeaningService: PhraseMeaningService) {}

  @Post()
  @SwaggerApiDocument({
    response: { type: CreatePhraseMeaningResponseDto },
    body: { type: CreatePhraseMeaningBodyDto, required: true },
    operation: {
      operationId: `createPhraseMeaning`,
      summary: `Api createPhraseMeaning`,
    },
  })
  async createPhraseMeaning(
    @Body() body: CreatePhraseMeaningBodyDto,
  ): Promise<CreatePhraseMeaningResponseDto> {
    return this.phraseMeaningService.createPhraseMeaning(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetPhraseMeaningListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getPhraseMeaningList`,
      summary: `Api getPhraseMeaningList`,
    },
  })
  async getPhraseMeaningList(
    @Query() query: GetPhraseMeaningListQueryDto,
  ): Promise<PaginationResponseDto<GetPhraseMeaningListResponseDto>> {
    return this.phraseMeaningService.getPhraseMeaningList(query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: { type: GetPhraseMeaningDetailResponseDto },
    operation: {
      operationId: `getPhraseMeaningDetail`,
      summary: `Api getPhraseMeaningDetail`,
    },
  })
  async getPhraseMeaningDetail(
    @Param('id') id: number,
  ): Promise<GetPhraseMeaningDetailResponseDto> {
    return this.phraseMeaningService.getPhraseMeaningDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: { type: UpdatePhraseMeaningResponseDto },
    body: { type: UpdatePhraseMeaningBodyDto, required: true },
    operation: {
      operationId: `updatePhraseMeaning`,
      summary: `Api updatePhraseMeaning`,
    },
  })
  async updatePhraseMeaning(
    @Param('id') id: number,
    @Body() body: UpdatePhraseMeaningBodyDto,
  ): Promise<UpdatePhraseMeaningResponseDto> {
    return this.phraseMeaningService.updatePhraseMeaning(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: { status: HttpStatus.NO_CONTENT },
    operation: {
      operationId: `deletePhraseMeaning`,
      summary: `Api deletePhraseMeaning`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhraseMeaning(@Param('id') id: number): Promise<void> {
    await this.phraseMeaningService.deletePhraseMeaning(id);
  }
}
