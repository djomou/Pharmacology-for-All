import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository }    from 'typeorm';
import { ForeignProduct } from './entities/foreign-product.entity';
import { Country }        from './entities/country.entity';

@Injectable()
export class InternationalService {
  constructor(
    @InjectRepository(ForeignProduct) private fpRepo:      Repository<ForeignProduct>,
    @InjectRepository(Country)        private countryRepo: Repository<Country>,
  ) {}

  // Recherche par NOM dans foreignproduct + jointure country pour le code ISO
  async searchByDrugName(drugName: string, page = 1, limit = 50) {
    if (!drugName || drugName.length < 2) {
      return { data: [], pagination: { total: 0, page, limit }, sourceQuery: drugName };
    }

    const qb = this.fpRepo.createQueryBuilder('fp')
      .select([
        'fp.foreignProductId', 'fp.name', 'fp.localName',
        'fp.companyName', 'fp.countryId', 'fp.atcClassId',
      ])
      .where('fp.name LIKE :q OR fp.localName LIKE :q', { q: `%${drugName}%` })
      .orderBy('fp.countryId', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rawData, total] = await qb.getManyAndCount();

    // Récupérer les codes pays
    const countryIds = [...new Set(rawData.map(fp => fp.countryId).filter(Boolean))];
    let countryMap: Record<number, { code: string; name: string }> = {};

    if (countryIds.length > 0) {
      const countries = await this.countryRepo
        .createQueryBuilder('c')
        .select(['c.countryId', 'c.code', 'c.name'])
        .where('c.countryId IN (:...ids)', { ids: countryIds })
        .getMany();
      countryMap = Object.fromEntries(
        countries.map(c => [c.countryId, { code: c.code, name: c.name }])
      );
    }

    const data = rawData.map(fp => ({
      ...fp,
      countryCode: countryMap[fp.countryId]?.code || '??',
      countryName: countryMap[fp.countryId]?.name || '',
    }));

    return { data, pagination: { total, page, limit }, sourceQuery: drugName };
  }

  async findEquivalents(foreignProductId: number) {
    const fp = await this.fpRepo
      .createQueryBuilder('fp')
      .select(['fp.foreignProductId','fp.name','fp.localName','fp.companyName','fp.countryId','fp.atcClassId'])
      .where('fp.foreignProductId = :id', { id: foreignProductId })
      .getOne();

    if (!fp) return { foreignProductId, data: [], count: 0 };

    // Trouver tous les produits avec le même atcClassId
    const related = await this.fpRepo
      .createQueryBuilder('fp')
      .select(['fp.foreignProductId','fp.name','fp.localName','fp.companyName','fp.countryId'])
      .where('fp.atcClassId = :atcId AND fp.foreignProductId != :id',
             { atcId: fp.atcClassId, id: foreignProductId })
      .take(50)
      .getMany();

    return { foreignProductId, source: fp, data: related, count: related.length };
  }

  async searchByCountry(countryId: number, q?: string, page = 1, limit = 20) {
    const qb = this.fpRepo.createQueryBuilder('fp')
      .select(['fp.foreignProductId','fp.name','fp.localName','fp.companyName'])
      .where('fp.countryId = :countryId', { countryId });
    if (q) qb.andWhere('fp.name LIKE :q', { q: `%${q}%` });
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit } };
  }

  async findAllCountries() {
    return this.countryRepo
      .createQueryBuilder('c')
      .select(['c.countryId', 'c.code', 'c.name'])
      .where('c.enabled = 1')
      .orderBy('c.name', 'ASC')
      .getMany();
  }

  async getStats() {
    const [foreignProducts, countries] = await Promise.all([
      this.fpRepo.createQueryBuilder('fp').getCount(),
      this.countryRepo.createQueryBuilder('c').getCount(),
    ]);
    return { foreignProducts, countries };
  }
}
