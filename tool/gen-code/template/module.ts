export function getModuleContent(moduleName: string, moduleNameKebab: string) {
  return `import { Module } from '@nestjs/common';
import { ${moduleName}Controller } from './${moduleNameKebab}.controller';
import { ${moduleName}Service } from './${moduleNameKebab}.service';

@Module({
  imports: [],
  controllers: [${moduleName}Controller],
  providers: [${moduleName}Service],
  exports: [${moduleName}Service],
})
export class ${moduleName}Module {}
`;
}
