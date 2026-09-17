import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product }    from './entities/product.entity';
import { Indication } from './entities/indication.entity';
import { Molecule }   from './entities/molecule.entity';
import { Warning }    from './entities/warning.entity';
import { AdvisorController } from './advisor.controller';
import { AdvisorService }    from './advisor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Indication, Molecule, Warning])],
  controllers: [AdvisorController],
  providers: [AdvisorService],
  exports: [AdvisorService],
})
export class AdvisorModule {}
