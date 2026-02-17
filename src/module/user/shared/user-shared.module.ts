import { Global, Module } from '@nestjs/common';
import { UserHelperService } from './user-helper.service';
import { UserPermissionService } from './user-permission.service';

@Module({
  imports: [],
  providers: [UserPermissionService, UserHelperService],
  exports: [UserPermissionService, UserHelperService],
})
@Global()
export class UserSharedModule {}
