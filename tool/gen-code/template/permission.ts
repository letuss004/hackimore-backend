export function getPermissionServiceContent(moduleName: string) {
  return `import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/module/base/database';

@Injectable()
export class ${moduleName}PermissionService {
  constructor(private readonly databaseService: DatabaseService) {}
}
`;
}
