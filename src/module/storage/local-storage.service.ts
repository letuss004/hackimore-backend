import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/module/base/database';
import { LocalStorageResponseDto, UploadFileBodyDto } from './dtos';

@Injectable()
export class LocalStorageService {
  constructor(private readonly databaseService: DatabaseService) {}

  async uploadLocalFile(body: UploadFileBodyDto): Promise<LocalStorageResponseDto> {
    return undefined;
  }

  async getLocalFile(filename: string) {
    return undefined;
  }
}
