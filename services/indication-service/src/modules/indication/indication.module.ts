import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Indication } from './entities/indication.entity';
import { Cim10 } from './entities/cim10.entity';
import { AtcClass } from './entities/atc-class.entity';
import { IndicationController } from './indication.controller';
import { IndicationService } from './indication.service';

@Module({
  imports: [TypeOrmModule.forFeature([Indication, Cim10, AtcClass])],
  controllers: [IndicationController],
  providers: [IndicationService],
})
export class IndicationModule {}
