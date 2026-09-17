import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Molecule } from './entities/molecule.entity';
import { MoleculeController } from './molecule.controller';
import { MoleculeService } from './molecule.service';

@Module({
  imports: [TypeOrmModule.forFeature([Molecule])],
  controllers: [MoleculeController],
  providers: [MoleculeService],
  exports: [MoleculeService],
})
export class MoleculeModule {}
