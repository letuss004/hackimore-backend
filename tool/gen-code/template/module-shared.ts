export function getSharedModuleContent(moduleName: string, moduleNameKebab: string) {
  return `import { Module } from '@nestjs/common';
import { ${moduleName}HelperService } from './${moduleNameKebab}-helper.service';
import { ${moduleName}PermissionService } from './${moduleNameKebab}-permission.service';

@Module({
  imports: [],
  providers: [${moduleName}PermissionService, ${moduleName}HelperService],
  exports: [${moduleName}PermissionService, ${moduleName}HelperService],
})
export class ${moduleName}SharedModule {}
`;
}
