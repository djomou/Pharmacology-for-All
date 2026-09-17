import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { Indication } from './entities/indication.entity';
import { Cim10 }      from './entities/cim10.entity';
import { AtcClass }   from './entities/atc-class.entity';

@Injectable()
export class IndicationService {
  constructor(
    @InjectRepository(Indication) private indicationRepo: Repository<Indication>,
    @InjectRepository(Cim10)      private cim10Repo:      Repository<Cim10>,
    @InjectRepository(AtcClass)   private atcRepo:        Repository<AtcClass>,
    private readonly dataSource: DataSource,
  ) {}

  async searchIndications(q: string, page = 1, limit = 20) {
    const qb = this.indicationRepo.createQueryBuilder('i')
      .select(['i.indicationId', 'i.name']);
    if (q && q.trim()) qb.where('i.name LIKE :q', { q: `%${q}%` });
    qb.orderBy('i.name', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async searchCim10(q: string, page = 1, limit = 20) {
    const qb = this.cim10Repo.createQueryBuilder('c')
      .select(['c.cim10Id', 'c.code', 'c.name', 'c.type']);
    if (q && q.trim()) qb.where('c.name LIKE :q OR c.code LIKE :q', { q: `%${q}%` });
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit } };
  }

  async searchAtc(q: string, page = 1, limit = 20) {
    const qb = this.atcRepo.createQueryBuilder('a')
      .select(['a.atcClassId', 'a.code', 'a.name', 'a.parentId']);
    if (q && q.trim()) qb.where('a.name LIKE :q OR a.code LIKE :q', { q: `%${q}%` });
    qb.orderBy('a.code', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit } };
  }

  // ─── MÉDICAMENTS PAR NOM D'INDICATION ────────────────────
  async searchDrugsByIndication(indicationName: string, page = 1, limit = 20) {
    if (!indicationName || indicationName.length < 2) {
      return { data: [], pagination: { total: 0, page, limit }, query: indicationName };
    }

    // Recherche dans les produits dont le nom ou le groupe de DCI
    // correspond à l'indication demandée
    const drugs = await this.dataSource.query(`
      SELECT DISTINCT
        p.productId,
        p.name,
        p.shortName,
        p.commercial_name AS commercialName,
        p.marketStatus,
        co.name AS companyName,
        gf.name AS formName
      FROM product p
      LEFT JOIN company     co ON co.companyId = p.companyId
      LEFT JOIN galenicForm gf ON gf.formId    = p.formId
      WHERE p.marketStatus = 1
        AND (
          p.name            LIKE ?
          OR p.shortName    LIKE ?
          OR p.commercial_name LIKE ?
          OR p.commonNameGroupId IN (
            SELECT commonNameGroupId FROM commonNameGroup
            WHERE name LIKE ? OR publicName LIKE ?
          )
        )
      ORDER BY p.name ASC
      LIMIT ? OFFSET ?
    `, [
      `%${indicationName}%`, `%${indicationName}%`, `%${indicationName}%`,
      `%${indicationName}%`, `%${indicationName}%`,
      limit, (page - 1) * limit,
    ]);

    const countResult = await this.dataSource.query(`
      SELECT COUNT(DISTINCT p.productId) AS total
      FROM product p
      WHERE p.marketStatus = 1
        AND (
          p.name LIKE ? OR p.shortName LIKE ? OR p.commercial_name LIKE ?
          OR p.commonNameGroupId IN (
            SELECT commonNameGroupId FROM commonNameGroup WHERE name LIKE ? OR publicName LIKE ?
          )
        )
    `, [`%${indicationName}%`, `%${indicationName}%`, `%${indicationName}%`,
        `%${indicationName}%`, `%${indicationName}%`]);

    const total = parseInt(countResult[0]?.total || '0');
    return {
      data: drugs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      query: indicationName,
    };
  }

  async getAtcByCode(code: string) {
    const atc = await this.atcRepo.createQueryBuilder('a')
      .select(['a.atcClassId', 'a.code', 'a.name'])
      .where('a.code = :code', { code }).getOne();
    if (!atc) throw new NotFoundException(`Code ATC ${code} introuvable`);
    return atc;
  }

  async getStats() {
    const [indications, cim10, atcClasses] = await Promise.all([
      this.indicationRepo.createQueryBuilder('i').getCount(),
      this.cim10Repo.createQueryBuilder('c').getCount(),
      this.atcRepo.createQueryBuilder('a').getCount(),
    ]);
    return { indications, cim10, atcClasses };
  }
}
