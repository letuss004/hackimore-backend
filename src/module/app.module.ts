import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ServerConfig } from '@server/config';
import basicAuth from 'express-basic-auth';
import path from 'path';
import { JOB_DEFAULT_OPTIONS } from 'src/common/const/queue';
import { IntegrationModule } from 'src/integration/integration.module';
import {
  CompressionMiddleware,
  CookieParserMiddleware,
  CorrelationIdMiddleware,
  HelmetMiddleware,
  HttpLoggerMiddleware,
} from 'src/middleware';
import { AuthModule } from 'src/module/auth';
import { BaseModule } from 'src/module/base';
import { PhraseModule } from 'src/module/phrase';
import { PodRegistrationModule } from 'src/module/pod-registration';
import { RedemptionModule } from 'src/module/redemption';
import { StorageModule } from 'src/module/storage';
import { SystemModule } from 'src/module/system/system.module';
import { UserModule } from 'src/module/user';

@Module({
  imports: [
    TerminusModule.forRoot(),
    ScheduleModule.forRoot(),
    DiscoveryModule,
    IntegrationModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../..', 'public'),
      serveRoot: '/',
    }),
    BullModule.forRoot({
      connection: { ...ServerConfig.getRedisCredentials() },
      defaultJobOptions: JOB_DEFAULT_OPTIONS,
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
      ...(!ServerConfig.isLocalEnv() && {
        middleware: basicAuth({
          challenge: true,
          users: {
            [ServerConfig.get().BULL_BOARD_USERNAME]:
              ServerConfig.get().BULL_BOARD_PASSWORD,
          },
        }),
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: ServerConfig.get().THROTTLER_TTL,
          limit: ServerConfig.get().THROTTLER_LIMIT,
        },
      ],
    }),

    // Common modules
    BaseModule,
    AuthModule,
    UserModule,
    SystemModule,
    StorageModule,
    // Business logic module
    PhraseModule,
    RedemptionModule,
    PodRegistrationModule,
  ],
  providers: [
    // no need to rate-limit in local env
    ...(!ServerConfig.isLocalEnv() && [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      },
    ]),
  ],
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
    consumer
      .apply(HttpLoggerMiddleware)
      .exclude('(v[0-9]+)/auth/(.*)', '(v[0-9]+)/storage/(.*)')
      .forRoutes('*');
  }
}
