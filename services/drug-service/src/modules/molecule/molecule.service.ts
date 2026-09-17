import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Molecule } from './entities/molecule.entity';

@Injectable()
export class MoleculeService {
  constructor(
    @InjectRepository(Molecule)
    private readonly moleculeRepo: Repository<Molecule>,
  ) {}

  async findAll(q?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = q ? { name: Like(`%${q}%`) } : {};
    const [data, total] = await this.moleculeRepo.findAndCount({
      where, skip, take: limit, order: { name: 'ASC' },
    });
    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(moleculeId: number) {
    const mol = await this.moleculeRepo.findOne({ where: { moleculeId } });
    if (!mol) throw new NotFoundException(`Molécule #${moleculeId} introuvable`);
    return mol;
  }

  async search(q: string, limit = 10) {
    return this.moleculeRepo
      .createQueryBuilder('m')
      .where('m.name LIKE :q', { q: `%${q}%` })
      .take(limit)
      .getMany();
  }
}
