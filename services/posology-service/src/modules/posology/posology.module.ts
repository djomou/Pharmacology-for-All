import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posology } from './entities/posology.entity';
import { PosologyUnit } from './entities/posology-unit.entity';
import { PosologyPhase } from './entities/posology-phase.entity';
import { PosologyController } from './posology.controller';
import { PosologyService } from './posology.service';

@Module({
  imports: [TypeOrmModule.forFeature([Posology, PosologyUnit, PosologyPhase])],
  controllers: [PosologyController],
  providers: [PosologyService],
  exports: [PosologyService],
})
export class PosologyModule {}
