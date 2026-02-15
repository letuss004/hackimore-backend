import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { getCurrentDate } from 'src/common/helpers/time';
import { ServerException } from 'src/exception';
import { DatabaseService } from 'src/module/base/database';
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

@Injectable()
export class RedemptionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createRedemption(
    userId: number,
    body: CreateRedemptionBodyDto,
  ): Promise<CreateRedemptionResponseDto> {
    return this.databaseService.redemption.create({
      data: { ...body, userId },
    });
  }

  async getRedemptionList(
    userId: number,
    query: GetRedemptionListQueryDto,
  ): Promise<GetRedemptionListResponseDto> {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);

    const where: Prisma.RedemptionWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { title: query.search },
          { description: query.search },
          { reward: query.search },
        ],
      }),
      userId,
    };

    const [data, total] = await Promise.all([
      this.databaseService.redemption.findMany({
        where,
        take,
        skip,
        orderBy: parseOrderByFromQuery(query.orderBy),
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.redemption.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, pagination: { page, pageSize, total, totalPages } };
  }

  async getRedemptionDetail(id: number): Promise<GetRedemptionDetailResponseDto> {
    const redemption = await this.databaseService.redemption.findFirst({ where: { id } });
    if (!redemption) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return redemption;
  }

  async updateRedemption(
    id: number,
    body: UpdateRedemptionBodyDto,
  ): Promise<UpdateRedemptionResponseDto> {
    const redemption = await this.databaseService.redemption.findFirst({ where: { id } });
    if (!redemption) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    if (body.status) {
      await this.patchRedemption(id, {
        status: body.status,
        description: body.description,
      });
    }

    return this.databaseService.redemption.update({
      where: { id },
      data: { ...body },
    });
  }

  async deleteRedemption(id: number) {
    const redemption = await this.databaseService.redemption.findFirst({ where: { id } });
    if (!redemption) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.redemption.delete({ where: { id } });
  }

  async patchRedemption(
    id: number,
    body: PatchRedemptionBodyDto,
  ): Promise<PatchRedemptionResponseDto> {
    const redemption = await this.databaseService.redemption.findFirst({ where: { id } });
    if (!redemption) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.redemption.update({
      where: { id },
      data: { ...body, archivedAt: getCurrentDate() },
    });
  }
}
