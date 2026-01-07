import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/module/base/database';

@Injectable()
export class TaskScheduleService {
  constructor(private readonly databaseService: DatabaseService) {}
}
