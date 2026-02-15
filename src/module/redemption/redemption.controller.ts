import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
  CreateRedemptionBodyDto,
  CreateRedemptionResponseDto,
  GetRedemptionDetailResponseDto,
  GetRedemptionListQueryDto,
  GetRedemptionListResponseDto,
  PatchRedemptionBodyDto,
  PatchRedemptionResponseDto,
  UpdateRedemptionBodyDto,
  UpdateRedemptionResponseDto,
} from './dtos';
import { RedemptionService } from './redemption.service';

@Controller('redemption')
@ApiTags('Redemption')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class RedemptionController {
  constructor(private readonly redemptionService: RedemptionService) {}

  @Post()
  @SwaggerApiDocument({
    response: { type: CreateRedemptionResponseDto },
    body: { type: CreateRedemptionBodyDto, required: true },
    operation: {
      operationId: `createRedemption`,
      summary: `Api createRedemption`,
    },
  })
  async createRedemption(
    @User('id') userId: number,
    @Body() body: CreateRedemptionBodyDto,
  ): Promise<CreateRedemptionResponseDto> {
    return this.redemptionService.createRedemption(userId, body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetRedemptionListResponseDto,
    },
    operation: {
      operationId: `getRedemptionList`,
      summary: `Api getRedemptionList`,
    },
  })
  async getRedemptionList(
    @User('id') userId: number,
    @Query() query: GetRedemptionListQueryDto,
  ): Promise<GetRedemptionListResponseDto> {
    return this.redemptionService.getRedemptionList(userId, query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: { type: GetRedemptionDetailResponseDto },
    operation: {
      operationId: `getRedemptionDetail`,
      summary: `Api getRedemptionDetail`,
    },
  })
  async getRedemptionDetail(
    @Param('id') id: number,
  ): Promise<GetRedemptionDetailResponseDto> {
    return this.redemptionService.getRedemptionDetail(id);
  }

  @Patch(':id')
  @SwaggerApiDocument({
    response: { type: PatchRedemptionResponseDto },
    body: { type: PatchRedemptionBodyDto, required: true },
    operation: {
      operationId: `patchRedemption`,
      summary: `Api patchRedemption`,
    },
  })
  async patchRedemption(
    @Param('id') id: number,
    @Body() body: PatchRedemptionBodyDto,
  ): Promise<PatchRedemptionResponseDto> {
    return this.redemptionService.patchRedemption(id, body);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: { type: UpdateRedemptionResponseDto },
    body: { type: UpdateRedemptionBodyDto, required: true },
    operation: {
      operationId: `updateRedemption`,
      summary: `Api updateRedemption`,
    },
  })
  async updateRedemption(
    @Param('id') id: number,
    @Body() body: UpdateRedemptionBodyDto,
  ): Promise<UpdateRedemptionResponseDto> {
    return this.redemptionService.updateRedemption(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: { status: HttpStatus.NO_CONTENT },
    operation: {
      operationId: `deleteRedemption`,
      summary: `Api deleteRedemption`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRedemption(@Param('id') id: number): Promise<void> {
    await this.redemptionService.deleteRedemption(id);
  }
}
