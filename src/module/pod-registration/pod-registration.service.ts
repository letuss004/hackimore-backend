import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ServerConfig } from '@server/config';
import { ServerLogger } from '@server/logger';
import { PaginationResponseDto } from '@server/platform/dtos';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
import { DatabaseService } from 'src/module/base/database';
import { EmailService } from 'src/module/base/email/email.service';
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
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async createPodRegistration(
    body: CreatePodRegistrationBodyDto,
  ): Promise<CreatePodRegistrationResponseDto> {
    const podRegistration = await this.databaseService.podRegistration.create({
      data: { ...body },
    });

    const currentYear = new Date().getFullYear();
    const createdAtFormatted = new Date(podRegistration.createdAt).toLocaleString(
      'vi-VN',
      {
        timeZone: 'Asia/Ho_Chi_Minh',
        dateStyle: 'full',
        timeStyle: 'short',
      },
    );

    Promise.all([
      // Send email to admin
      this.emailService.send({
        to: ServerConfig.get().SMTP_GMAIL_USER,
        subject: `[POD] Đăng ký mới từ ${body.fullName}`,
        template: 'pod-registration-admin',
        variables: {
          fullName: body.fullName,
          email: body.email,
          phone: body.phone,
          idea: body.idea,
          details: body.details,
          createdAt: createdAtFormatted,
          year: currentYear,
        },
      }),
      // Send confirmation email to user
      this.emailService.send({
        to: body.email,
        subject: '[POD] Xác nhận đăng ký Demo',
        template: 'pod-registration-user',
        variables: {
          fullName: body.fullName,
          email: body.email,
          phone: body.phone,
          idea: body.idea,
          details: body.details,
          year: currentYear,
        },
      }),
    ]).catch((error) => {
      ServerLogger.error({
        error,
        message: 'Failed to send pod registration email',
        context: `PodRegistrationService.createPodRegistration`,
      });
    });

    return podRegistration;
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
