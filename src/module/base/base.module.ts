import { Global, Module } from '@nestjs/common';
import { CacheModule } from 'src/module/base/cache';
import { DatabaseModule } from 'src/module/base/database';
import { EmailModule } from 'src/module/base/email/email.module';
import { HttpModule } from 'src/module/base/http/http.module';
import { UserUtil } from 'src/module/user/user.util';
import { PermissionService } from './permission.service';

@Global()
@Module({
  imports: [DatabaseModule, CacheModule, EmailModule, HttpModule],
  providers: [PermissionService, UserUtil],
  exports: [
    DatabaseModule,
    CacheModule,
    EmailModule,
    HttpModule,
    //
    UserUtil,
  ],
})
export class BaseModule {}
