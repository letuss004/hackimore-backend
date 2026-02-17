import { _ } from '@server/libs/lodash';

export function getEmptyControllerContent(
  moduleName: string,
  moduleNameKebab: string,
): string {
  const tag = _.words(moduleName).join(' ');
  const nameCamel = _.camelCase(moduleName);

  return `import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessRole } from 'src/common/enums';
import { RoleBaseAccessControl, SwaggerApiDocument } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import { ${moduleName}Service } from './${moduleNameKebab}.service';

@Controller('${moduleNameKebab}')
@ApiTags('${tag}')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([])
@ApiBearerAuth()
export class ${moduleName}Controller {
  constructor(private readonly ${nameCamel}Service: ${moduleName}Service) {}
}
`;
}

export function getCompleteControllerContent(
  moduleName: string,
  moduleNameKebab: string,
): string {
  const nameCamel = _.camelCase(moduleName);
  const tag = _.words(moduleName).join(' ');
  return `import {
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
import { AccessRole } from 'src/common/enums';
import { PaginationResponseDto } from '@server/platform/dtos';
import { RoleBaseAccessControl, SwaggerApiDocument } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import { ${moduleName}Service } from './${moduleNameKebab}.service';
import {
  Create${moduleName}BodyDto,
  Create${moduleName}ResponseDto,
  Get${moduleName}DetailResponseDto,
  Get${moduleName}ListQueryDto,
  Get${moduleName}ListResponseDto,
  Update${moduleName}BodyDto,
  Update${moduleName}ResponseDto,
} from './dtos';

@Controller('${moduleNameKebab}')
@ApiTags('${tag}')
@UseGuards(AuthGuard)
@RoleBaseAccessControl([])
@ApiBearerAuth()
export class ${moduleName}Controller {
  constructor(private readonly ${nameCamel}Service: ${moduleName}Service) {}

  @Post()
  @SwaggerApiDocument({
    response: { type: Create${moduleName}ResponseDto },
    body: { type: Create${moduleName}BodyDto, required: true },
    operation: {
      operationId: \`create${moduleName}\`,
      summary: \`Api create${moduleName}\`,
    },
  })
  async create${moduleName}(
    @Body() body: Create${moduleName}BodyDto,
  ): Promise<Create${moduleName}ResponseDto> {
    return this.${nameCamel}Service.create${moduleName}(body);
  }

  @Get()
  @SwaggerApiDocument({
    response: {
      type: Get${moduleName}ListResponseDto,
    },
    operation: {
      operationId: \`get${moduleName}List\`,
      summary: \`Api get${moduleName}List\`,
    },
  })
  async get${moduleName}List(
    @Query() query: Get${moduleName}ListQueryDto,
  ): Promise<Get${moduleName}ListResponseDto> {
    return this.${nameCamel}Service.get${moduleName}List(query);
  }

  @Get(':id')
  @SwaggerApiDocument({
    response: { type: Get${moduleName}DetailResponseDto },
    operation: {
      operationId: \`get${moduleName}Detail\`,
      summary: \`Api get${moduleName}Detail\`,
    },
  })
  async get${moduleName}Detail(
    @Param('id') id: number,
  ): Promise<Get${moduleName}DetailResponseDto> {
    return this.${nameCamel}Service.get${moduleName}Detail(id);
  }

  @Put(':id')
  @SwaggerApiDocument({
    response: { type: Update${moduleName}ResponseDto },
    body: { type: Update${moduleName}BodyDto, required: true },
    operation: {
      operationId: \`update${moduleName}\`,
      summary: \`Api update${moduleName}\`,
    },
  })
  async update${moduleName}(
    @Param('id') id: number,
    @Body() body: Update${moduleName}BodyDto,
  ): Promise<Update${moduleName}ResponseDto> {
    return this.${nameCamel}Service.update${moduleName}(id, body);
  }

  @Delete(':id')
  @SwaggerApiDocument({
    response: { status: HttpStatus.NO_CONTENT },
    operation: {
      operationId: \`delete${moduleName}\`,
      summary: \`Api delete${moduleName}\`,
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete${moduleName}(@Param('id') id: number): Promise<void> {
    await this.${nameCamel}Service.delete${moduleName}(id);
  }
}
`;
}
