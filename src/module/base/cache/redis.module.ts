import { RedisModule as NestjsRedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ServerConfig } from '@server/config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestjsRedisModule.forRoot({
      type: 'single',
      options: { ...ServerConfig.getRedisCredentials() },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
