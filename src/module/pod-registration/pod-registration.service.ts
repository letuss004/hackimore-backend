import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
import { DatabaseService } from 'src/module/base/database';
import {
  CreatePodRegistrationBodyDto,
  CreatePodRegistrationResponseDto,
  GetPodRegistrationDetailResponseDto,
  GetPodRegistrationListQueryDto,
  GetPodRegistrationListResponseDto,
  UpdatePodRegistrationBodyDto,
  UpdatePodRegistrationResponseDto,
} from './dtos';

@Injectable()
export class PodRegistrationService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPodRegistration(
    body: CreatePodRegistrationBodyDto,
  ): Promise<CreatePodRegistrationResponseDto> {
    return this.databaseService.podRegistration.create({
      data: { ...body },
    });
  }

  async getPodRegistrationList(
    query: GetPodRegistrationListQueryDto,
  ): Promise<PaginationResponseDto<GetPodRegistrationListResponseDto>> {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.PodRegistrationWhereInput = {
      ...(query.id && { id: query.id }),
      ...(query.fullName && { fullName: query.fullName }),
      ...(query.email && { email: query.email }),
      ...(query.phone && { phone: query.phone }),
      ...(query.idea && { idea: query.idea }),
      ...(query.details && { details: query.details }),
    };
    if (query.createdAtRangeStart || query.createdAtRangeEnd) {
      where.createdAt = {
        gte: query.createdAtRangeStart,
        lte: query.createdAtRangeEnd,
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.podRegistration.findMany({
        where,
        take,
        skip,
        orderBy: parseOrderByFromQuery(query.orderBy),
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.podRegistration.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getPodRegistrationDetail(
    id: number,
  ): Promise<GetPodRegistrationDetailResponseDto> {
    const podRegistration = await this.databaseService.podRegistration.findFirst({
      where: { id },
    });
    if (!podRegistration) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return podRegistration;
  }

  async updatePodRegistration(
    id: number,
    body: UpdatePodRegistrationBodyDto,
  ): Promise<UpdatePodRegistrationResponseDto> {
    const podRegistration = await this.databaseService.podRegistration.findFirst({
      where: { id },
    });
    if (!podRegistration) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.podRegistration.update({
      where: { id },
      data: { ...body },
    });
  }

  async deletePodRegistration(id: number) {
    const podRegistration = await this.databaseService.podRegistration.findFirst({
      where: { id },
    });
    if (!podRegistration) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.podRegistration.delete({ where: { id } });
  }
}
