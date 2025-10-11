import { Global, Module } from '@nestjs/common';
import { S3Module } from 'src/integration/s3';

@Global()
@Module({
  imports: [S3Module],
  providers: [],
  exports: [S3Module],
})
export class IntegrationModule {}
