import { confirm, input, select } from '@inquirer/prompts';
import { ValidationError } from '@server/errors';
import { fs } from '@server/libs/file-system-manipulate';
import { _ } from '@server/libs/lodash';
import { ensureDirectoryExists } from 'src/common/helpers/file-system';
import { TypescriptParser } from 'typescript-parser';
import { PropertyDeclaration } from 'typescript-parser/declarations/PropertyDeclaration';
import {
  getCompleteControllerContent,
  getEmptyControllerContent,
} from './template/controller';
import { getDtoContent } from './template/index-dto';
import { getModuleContent } from './template/module';
import { getModuleIndexFileContent } from './template/module-index';
import { getCompleteServiceContent, getEmptyServiceContent } from './template/service';

export class CodeGenerator {
  private readonly options: Record<string, any> = {};
  private readonly USER_SELECT = {
    CompleteModule: 'GenerateCompleteModule',
    EmptyModule: 'EmptyModule',
    Dto: 'Dto',
  };
  private readonly parser = new TypescriptParser();
  private prismaImport: any = [];
  private prismaEnums: string[] = [];
  private modelProperties: PropertyDeclaration[] = [];

  async run() {
    try {
      await this.parseOptions();
      // prepare
      await this.prepare();
      // write
      const promises = [];
      switch (this.options.userSelect) {
        case this.USER_SELECT.CompleteModule:
          return Promise.all([
            this.writeModuleFile(),
            this.writeServiceFile(),
            this.writeControllerFile(),
            this.writeDtosDirectory(),
            this.writeModuleIndexFile(),
          ]);
        case this.USER_SELECT.EmptyModule:
          return Promise.all([
            this.writeModuleFile(),
            this.writeServiceFile(),
            this.writeControllerFile(),
            this.writeModuleIndexFile(),
          ]);
        case this.USER_SELECT.Dto:
          return this.writeDtosDirectory();
        default:
      }
    } catch (error) {
      await fs.rmdir(this.options.modulePath);
    }
  }

  private async prepare() {
    const prismaDtoFilepath = `prisma/dtos/${this.options.modelFilename}.ts`;
    const isExist = fs.existsSync(prismaDtoFilepath);
    if (!isExist) {
      return;
    }
    const parse: any = await this.parser.parseFile(prismaDtoFilepath, '.');
    this.modelProperties = parse.declarations[0].properties.filter(
      (property: any) => !['isDeleted', 'updatedAt'].includes(property.name),
    );
    this.prismaImport = parse.imports[1]?.specifiers;
    this.prismaEnums = parse.imports[1]?.specifiers.map((e: any) => e.specifier);
  }

  private async parseOptions() {
    const userSelect = await select({
      message: `What do you want to generate?`,
      choices: [
        {
          name: 'Complete module',
          value: this.USER_SELECT.CompleteModule,
          description: `Generate module, service, controller with CRUD operations`,
        },
        {
          name: 'Empty module',
          value: this.USER_SELECT.EmptyModule,
          description: `Generate module, service, controller with empty content`,
        },
        {
          name: 'Dtos only',
          value: this.USER_SELECT.Dto,
          description: `Generate module dtos based on schema.prisma`,
        },
      ],
    });
    Object.assign(this.options, { userSelect });

    switch (userSelect) {
      case this.USER_SELECT.CompleteModule:
        await this.parseModuleName();
        await this.parseModulePath();
        await this.parseModelName();
        break;
      case this.USER_SELECT.EmptyModule:
        await this.parseModuleName();
        await this.parseModulePath();
        break;
      case this.USER_SELECT.Dto:
        await this.parseModelName();
        await this.parseModuleName();
        await this.parseModulePath();
        break;
    }
  }

  private async parseModuleName() {
    const moduleName = await input({
      message: 'Enter module name',
      required: true,
    });
    Object.assign(this.options, {
      moduleName: _.upperFirst(_.camelCase(moduleName)),
      moduleNameKebab: _.kebabCase(moduleName),
      moduleNameKebabUnderscore: _.kebabCase(moduleName).replace(/-/g, '_'),
    });
  }

  private async parseModulePath(useNameAsPath: boolean = true) {
    let modulePath: string;

    if (useNameAsPath) {
      const nameKebab = this.options.moduleNameKebab;
      modulePath = `src/module/${nameKebab}`;
      const isUseDefaultPath = await confirm({
        message: `Do you want to use default module path ${modulePath}`,
        default: true,
      });
      if (isUseDefaultPath) {
        await ensureDirectoryExists(modulePath);
        Object.assign(this.options, { modulePath });
        return;
      }
    }
    const path = await input({
      message: 'Enter module path which is relative from src/modules',
      required: true,
    });
    modulePath = `src/module/${path}`;
    await ensureDirectoryExists(modulePath);
    Object.assign(this.options, { modulePath });
  }

  private async parseModelName() {
    const modelName = await input({
      message: 'Enter Prisma model for this module (take from schema.prisma)',
      required: true,
    });
    await fs.readFile('prisma/schema.prisma').then((data) => {
      const isMatch = data.toString().match(`model ${modelName} {`);
      if (!isMatch) {
        throw new ValidationError(`Model ${modelName} not found in schema.prisma`);
      }
    });
    Object.assign(this.options, {
      modelName,
      modelNameCamel: _.camelCase(modelName),
      modelFilename: _.kebabCase(modelName).replace(/-/g, '_'),
    });
  }

  private writeModuleFile() {
    const nameKebab = this.options.moduleNameKebab;
    return fs.writeFile(
      `${this.options.modulePath}/${nameKebab}.module.ts`,
      getModuleContent(this.options.moduleName, this.options.moduleNameKebab),
    );
  }

  private writeServiceFile() {
    const nameKebab = this.options.moduleNameKebab;

    if (this.options.userSelect === this.USER_SELECT.EmptyModule) {
      const content = getEmptyServiceContent(this.options.moduleName);
      return fs.writeFile(`${this.options.modulePath}/${nameKebab}.service.ts`, content);
    }

    const normalProperties = [];
    const dateProperties = [];
    for (const property of this.modelProperties) {
      if (property.type === 'Date') {
        dateProperties.push(property);
      } else {
        normalProperties.push(property);
      }
    }
    const normalFilter = normalProperties
      .map((prop) => {
        return `      ...(query.${prop.name} && { ${prop.name}: query.${prop.name} }),`;
      })
      .join('\n');
    const dateFilter = dateProperties
      .map((prop) => {
        return `    if (query.${prop.name}RangeStart || query.${prop.name}RangeEnd) {
      where.${prop.name} = {
        gte: query.${prop.name}RangeStart,
        lte: query.${prop.name}RangeEnd,
      };
    }`;
      })
      .join('\n');

    const content = getCompleteServiceContent({
      normalFilter,
      dateFilter,
      moduleName: this.options.moduleName,
      model: this.options.modelName,
      modelCamel: this.options.modelNameCamel,
    });
    return fs.writeFile(`${this.options.modulePath}/${nameKebab}.service.ts`, content);
  }

  private writeControllerFile() {
    const nameKebab = this.options.moduleNameKebab;
    const content =
      this.options.userSelect === this.USER_SELECT.EmptyModule
        ? getEmptyControllerContent(this.options.moduleName, this.options.moduleNameKebab)
        : getCompleteControllerContent(
            this.options.moduleName,
            this.options.moduleNameKebab,
          );
    return fs.writeFile(`${this.options.modulePath}/${nameKebab}.controller.ts`, content);
  }

  private async writeDtosDirectory() {
    await ensureDirectoryExists(`${this.options.modulePath}/dtos`);

    if (this.options.userSelect === this.USER_SELECT.EmptyModule) {
      return fs.writeFile(`${this.options.modulePath}/dtos/index.ts`, '');
    }

    const responseProperties = this.modelProperties
      .map((prop) => this.makePropertyDto(prop, 'response'))
      .join('\n');

    const bodyProperties = this.modelProperties
      .filter((prop) => !['id', 'createdAt'].includes(prop.name))
      .map((prop) => this.makePropertyDto(prop, 'body'))
      .join('\n');

    const queryProp = this.getQueryProperties(this.modelProperties).map((prop) =>
      this.makePropertyDto(prop, 'query'),
    );
    const queryProperties = this.addQueryOrderByProperty(queryProp).join('\n');

    const specifiers = this.prismaImport?.map((e: any) => e.specifier);
    let importContent = ``;
    if (specifiers) {
      importContent = `import { ${specifiers.join(', ')} } from '@prisma/client';`;
    }

    return fs.writeFile(
      `${this.options.modulePath}/dtos/index.ts`,
      getDtoContent({
        responseProperties,
        queryProperties,
        bodyProperties,
        importContent,
        moduleName: this.options.moduleName,
      }),
    );
  }

  private addQueryOrderByProperty(queryProp: string[]) {
    const modelName = this.options.modelName;
    queryProp.push(`
  @MultipleOrderBy(DatabaseModelFields.${modelName})
  orderBy: string[];
  `);
    return queryProp;
  }

  private writeModuleIndexFile() {
    return fs.writeFile(
      `${this.options.modulePath}/index.ts`,
      getModuleIndexFileContent(this.options.nameKebab),
    );
  }

  /**
   * Transform model properties to query properties (add range for Date type)
   * */
  private getQueryProperties(properties: PropertyDeclaration[]) {
    const result: PropertyDeclaration[] = [];
    for (const property of properties) {
      if (property.type === 'Date') {
        result.push(
          { ...property, name: `${property.name}RangeStart` },
          { ...property, name: `${property.name}RangeEnd` },
        );
      } else {
        result.push(property);
      }
    }
    return result;
  }

  // ****************************** file content methods ******************************
  private makePropertyDto = (
    property: PropertyDeclaration,
    type: 'query' | 'response' | 'body',
  ) => {
    const structure = this.isEnum(property) ? `\n    structure: 'enum',` : '';
    switch (type) {
      case 'response':
        return `  @PropertyDto()\n  ${property.name}: ${property.type};\n`;
      case 'query':
        return `  @PropertyDto({
    type: ${_.upperFirst(_.camelCase(property.type))},
    required: false,
    validated: true,${structure}
  })
  ${property.name}: ${property.type};\n`;
      case 'body':
        return `  @PropertyDto({
    type: ${_.upperFirst(_.camelCase(property.type))},
    required: ${!property.isOptional},
    validated: true,${structure}
  })
  ${property.name}: ${property.type};\n`;
      default:
      // not supported yet
    }
  };

  private isEnum(property: PropertyDeclaration): boolean {
    return this.prismaEnums?.includes(property.type);
  }
}
