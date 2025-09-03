import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessRole } from 'src/common/enums';
import { RoleBaseAccessControl, SwaggerApiDocument } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import { TriggerBackupDatabaseResponseDto } from 'src/module/app/task-manager/dtos';
import { TaskManagerService } from './task-manager.service';

@Controller('task-schedule')
@ApiTags('Task schedule manager')
@UseGuards(AuthGuard)
@RoleBaseAccessControl(AccessRole.Admin)
@ApiBearerAuth()
export class TaskManagerController {
  constructor(private readonly taskManagerService: TaskManagerService) {}

  @Post('trigger/backup')
  @SwaggerApiDocument({
    response: {
      type: TriggerBackupDatabaseResponseDto,
      description: `TriggerBackupDatabase`,
    },
    operation: {
      operationId: `triggerBackupDatabase`,
      summary: `Api triggerBackupDatabase`,
    },
  })
  async triggerBackupDatabase(): Promise<TriggerBackupDatabaseResponseDto> {
    return this.taskManagerService.triggerBackupDatabase();
  }
}
