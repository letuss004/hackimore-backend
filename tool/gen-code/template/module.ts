export function getModuleContent(moduleName: string, moduleNameKebab: string) {
  return `import { Module } from '@nestjs/common';
import { ${moduleName}Controller } from './${moduleNameKebab}.controller';
import { ${moduleName}Service } from './${moduleNameKebab}.service';
import { ${moduleName}SharedModule } from './shared/${moduleNameKebab}-shared.module';

@Module({
  imports: [${moduleName}SharedModule],
  controllers: [${moduleName}Controller],
  providers: [${moduleName}Service],
  exports: [${moduleName}Service],
})
export class ${moduleName}Module {}
`;
}
