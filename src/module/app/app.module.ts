import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import {
  CompressionMiddleware,
  CookieParserMiddleware,
  CorrelationIdMiddleware,
  HelmetMiddleware,
  HttpLoggerMiddleware,
} from 'src/middleware';
import { AuthModule } from 'src/module/auth';
import { BaseModule } from 'src/module/base';
import { StorageModule } from 'src/module/storage';
import { UserModule } from 'src/module/user';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskManagerController } from './task-manager/task-manager.controller';
import { TaskManagerService } from './task-manager/task-manager.service';
import { TaskScheduleService } from './task-schedule.service';

@Module({
  imports: [
    TerminusModule.forRoot(),
    ScheduleModule.forRoot(),
    DiscoveryModule,
    BaseModule,
    StorageModule,
    AuthModule,
    UserModule,
    // Business logic module
  ],
  controllers: [AppController, TaskManagerController],
  providers: [AppService, TaskManagerService, TaskScheduleService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    HelmetMiddleware.configure({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    });

    consumer
      .apply(
        CorrelationIdMiddleware,
        HelmetMiddleware,
        CookieParserMiddleware,
        CompressionMiddleware,
      )
      .forRoutes('*');

    // logger
    consumer.apply(HttpLoggerMiddleware).exclude('(v[0-9]+)/auth/(.*)').forRoutes('*');

    // error-able middleware
    // consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
