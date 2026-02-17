export function getServiceHelperContent(moduleName: string) {
  return `import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/module/base/database';

@Injectable()
export class ${moduleName}HelperService {
  constructor(private readonly databaseService: DatabaseService) {}
}
`;
}
