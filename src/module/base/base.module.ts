import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/module/base/database';
import { EmailModule } from 'src/module/base/email/email.module';
import { HttpModule } from 'src/module/base/http/http.module';
import { RedisModule } from 'src/module/base/redis';
import { UserUtil } from 'src/module/user/user.util';
import { PermissionService } from './permission.service';

@Global()
@Module({
  imports: [DatabaseModule, RedisModule, EmailModule, HttpModule],
  providers: [PermissionService, UserUtil],
  exports: [
    DatabaseModule,
    RedisModule,
    EmailModule,
    HttpModule,
    //
    UserUtil,
  ],
})
export class BaseModule {}
