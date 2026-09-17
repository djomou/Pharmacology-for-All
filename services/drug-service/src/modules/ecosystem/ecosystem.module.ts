import { Module } from '@nestjs/common';
import { EcosystemService } from './ecosystem.service';

@Module({
  providers: [EcosystemService],
  exports:   [EcosystemService],
})
export class EcosystemModule {}
