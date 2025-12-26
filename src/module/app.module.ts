import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
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
    BaseModule,
    AuthModule,
    UserModule,
    SystemModule,
    StorageModule,
    // Business logic module
    PhraseModule,
    RedemptionModule,
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

    // error-able middleware
    // consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
