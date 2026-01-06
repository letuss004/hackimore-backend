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
  CreatePodRegistrationBodyDto,
  CreatePodRegistrationResponseDto,
  GetPodRegistrationDetailResponseDto,
  GetPodRegistrationListQueryDto,
  GetPodRegistrationListResponseDto,
  UpdatePodRegistrationBodyDto,
  UpdatePodRegistrationResponseDto,
} from './dtos';
import { PodRegistrationService } from './pod-registration.service';

@Controller('pod-registration')
@ApiTags('Pod Registration')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([AccessRole.Admin])
@ApiBearerAuth()
export class PodRegistrationController {
  constructor(private readonly podRegistrationService: PodRegistrationService) {}

  @Post()
  @RoleBaseAccessControl([AccessRole.Public])
  @SwaggerApiDocument({
    response: { type: CreatePodRegistrationResponseDto },
    body: { type: CreatePodRegistrationBodyDto, required: true },
    operation: {
      operationId: `createPodRegistration`,
      summary: `Api createPodRegistration`,
    },
  })
  async createPodRegistration(
    @Body() body: CreatePodRegistrationBodyDto,
  ): Promise<CreatePodRegistrationResponseDto> {
    return this.podRegistrationService.createPodRegistration(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: GetPodRegistrationListResponseDto,
      isPagination: true,
    },
    operation: {
      operationId: `getPodRegistrationList`,
      summary: `Api getPodRegistrationList`,
    },
  })
  async getPodRegistrationList(
    @Query() query: GetPodRegistrationListQueryDto,
  ): Promise<PaginationResponseDto<GetPodRegistrationListResponseDto>> {
    return this.podRegistrationService.getPodRegistrationList(query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: { type: GetPodRegistrationDetailResponseDto },
    operation: {
      operationId: `getPodRegistrationDetail`,
      summary: `Api getPodRegistrationDetail`,
    },
  })
  async getPodRegistrationDetail(
    @Param('id') id: number,
  ): Promise<GetPodRegistrationDetailResponseDto> {
    return this.podRegistrationService.getPodRegistrationDetail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: { type: UpdatePodRegistrationResponseDto },
    body: { type: UpdatePodRegistrationBodyDto, required: true },
    operation: {
      operationId: `updatePodRegistration`,
      summary: `Api updatePodRegistration`,
    },
  })
  async updatePodRegistration(
    @Param('id') id: number,
    @Body() body: UpdatePodRegistrationBodyDto,
  ): Promise<UpdatePodRegistrationResponseDto> {
    return this.podRegistrationService.updatePodRegistration(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: { status: HttpStatus.NO_CONTENT },
    operation: {
      operationId: `deletePodRegistration`,
      summary: `Api deletePodRegistration`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePodRegistration(@Param('id') id: number): Promise<void> {
    await this.podRegistrationService.deletePodRegistration(id);
  }
}
