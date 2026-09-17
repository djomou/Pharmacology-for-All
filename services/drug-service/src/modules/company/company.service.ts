import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async findAll(q?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = q ? { name: Like(`%${q}%`) } : {};
    const [data, total] = await this.companyRepo.findAndCount({
      where, skip, take: limit, order: { name: 'ASC' },
    });
    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(companyId: number) {
    const company = await this.companyRepo.findOne({ where: { companyId } });
    if (!company) throw new NotFoundException(`Laboratoire #${companyId} introuvable`);
    return company;
  }
}
