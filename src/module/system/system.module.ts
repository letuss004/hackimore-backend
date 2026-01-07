import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { BackupDatabaseProcessor } from 'src/module/system/processor/backup-database.processor';
import { SystemQueueName } from 'src/module/system/system.enum';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { TaskManagerController } from './task-manager/task-manager.controller';
import { TaskManagerService } from './task-manager/task-manager.service';
import { TaskScheduleService } from './task-schedule.service';

@Module({
  imports: [
    TerminusModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: SystemQueueName.BackupDatabase,
    }),
    BullBoardModule.forFeature({
      name: SystemQueueName.BackupDatabase,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [SystemController, TaskManagerController],
  providers: [
    SystemService,
    TaskManagerService,
    TaskScheduleService,
    BackupDatabaseProcessor,
  ],
})
export class SystemModule {}
