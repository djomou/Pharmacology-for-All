import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posology } from './entities/posology.entity';
import { PosologyUnit } from './entities/posology-unit.entity';
import { PosologyPhase } from './entities/posology-phase.entity';

@Injectable()
export class PosologyService {
  constructor(
    @InjectRepository(Posology)      private posologyRepo: Repository<Posology>,
    @InjectRepository(PosologyUnit)  private unitRepo: Repository<PosologyUnit>,
    @InjectRepository(PosologyPhase) private phaseRepo: Repository<PosologyPhase>,
  ) {}

  async findByProduct(posologyAmmId: number) {
    const data = await this.posologyRepo.find({ where: { posologyAmmId } });
    if (!data.length) throw new NotFoundException(`Aucune posologie pour l'AMM #${posologyAmmId}`);
    return data;
  }

  async findAllUnits() {
    return this.unitRepo.find({ order: { name: 'ASC' } });
  }

  async findAllPhases() {
    return this.phaseRepo.find({ order: { posologyPhaseId: 'ASC' } });
  }

  async findOne(posologyId: number) {
    const p = await this.posologyRepo.findOne({ where: { posologyId } });
    if (!p) throw new NotFoundException(`Posologie #${posologyId} introuvable`);
    return p;
  }

  async getStats() {
    const total  = await this.posologyRepo.count();
    const units  = await this.unitRepo.count();
    const phases = await this.phaseRepo.count();
    return { totalPosologies: total, totalUnits: units, totalPhases: phases };
  }
}
