export function getEmptyServiceContent(moduleName: string): string {
  return `import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/module/base/database';

@Injectable()
export class ${moduleName}Service {
  constructor(private readonly databaseService: DatabaseService) {}
}
`;
}

export function getCompleteServiceContent(args: {
  normalFilter: string;
  dateFilter: string;
  moduleName: string;
  modelCamel: string;
  model: string;
}): string {
  const { normalFilter, dateFilter, moduleName, modelCamel, model } = args;

  return `import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_RESPONSE } from 'src/common/const';
import { parseOrderByFromQuery } from 'src/common/helpers/database';
import { validatePaginationQueryDto } from 'src/common/helpers/request';
import { ServerException } from 'src/exception';
import { DatabaseService } from 'src/module/base/database';
import {
  Create${moduleName}BodyDto,
  Create${moduleName}ResponseDto,
  Get${moduleName}DetailResponseDto,
  Get${moduleName}ListQueryDto,
  Get${moduleName}ListResponseDto,
  Update${moduleName}BodyDto,
  Update${moduleName}ResponseDto,
} from './dtos';

@Injectable()
export class ${moduleName}Service {
  constructor(private readonly databaseService: DatabaseService) {}

  async create${moduleName}(body: Create${moduleName}BodyDto): Promise<Create${moduleName}ResponseDto> {
    return this.databaseService.${modelCamel}.create({
      data: { ...body },
    });
  };

  async get${moduleName}List(query: Get${moduleName}ListQueryDto): Promise<Get${moduleName}ListResponseDto> {
    const { page, pageSize, take, skip } = validatePaginationQueryDto(query);
    
    const where: Prisma.${model}WhereInput = {
${normalFilter}
    };
${dateFilter};

    const [items, total] = await Promise.all([
      this.databaseService.${modelCamel}.findMany({
        where,
        take,
        skip,
        orderBy: parseOrderByFromQuery(query.orderBy),
        ...(query.lastItemId && { cursor: { id: query.lastItemId } }),
      }),
      this.databaseService.${modelCamel}.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { items, pagination: { page, pageSize, total, totalPages } };
  }

  async get${moduleName}Detail(id: number): Promise<Get${moduleName}DetailResponseDto> {
    const ${modelCamel} = await this.databaseService.${modelCamel}.findFirst({ where: { id } });
    if (!${modelCamel}) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return ${modelCamel};
  }

  async update${moduleName}(id: number, body: Update${moduleName}BodyDto): Promise<Update${moduleName}ResponseDto> {
    const ${modelCamel} = await this.databaseService.${modelCamel}.findFirst({ where: { id } });
    if (!${modelCamel}) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.${modelCamel}.update({
      where: { id },
      data: { ...body },
    });
  }

  async delete${moduleName}(id: number) {
    const ${modelCamel} = await this.databaseService.${modelCamel}.findFirst({ where: { id } });
    if (!${modelCamel}) {
      throw new ServerException(ERROR_RESPONSE.RESOURCE_NOT_FOUND);
    }
    return this.databaseService.${modelCamel}.delete({ where: { id } });
  }
}
`;
}
