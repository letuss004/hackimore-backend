import { Global, Module } from '@nestjs/common';
import { AwsModule } from 'src/integration/aws/aws.module';

@Global()
@Module({
  imports: [AwsModule],
  exports: [AwsModule],
})
export class IntegrationModule {}
