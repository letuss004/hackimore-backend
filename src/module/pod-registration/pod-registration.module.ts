import { Module } from '@nestjs/common';
import { PodRegistrationController } from './pod-registration.controller';
import { PodRegistrationService } from './pod-registration.service';

@Module({
  imports: [],
  controllers: [PodRegistrationController],
  providers: [PodRegistrationService],
  exports: [PodRegistrationService],
})
export class PodRegistrationModule {}
