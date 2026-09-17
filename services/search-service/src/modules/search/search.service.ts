import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSearch }    from './entities/product-search.entity';
import { MoleculeSearch }   from './entities/molecule-search.entity';
import { IndicationSearch } from './entities/indication-search.entity';
import { Cim10Search }      from './entities/cim10-search.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(ProductSearch)    private productRepo:    Repository<ProductSearch>,
    @InjectRepository(MoleculeSearch)   private moleculeRepo:   Repository<MoleculeSearch>,
    @InjectRepository(IndicationSearch) private indicationRepo: Repository<IndicationSearch>,
    @InjectRepository(Cim10Search)      private cim10Repo:      Repository<Cim10Search>,
  ) {}

  async globalSearch(q: string, limit = 5) {
    if (!q || q.length < 2) return { query: q, results: {} };

    const [products, molecules, indications, cim10] = await Promise.all([
      this.productRepo.createQueryBuilder('p')
        .select(['p.productId', 'p.name', 'p.shortName', 'p.commercialName'])
        .where('p.name LIKE :q OR p.shortName LIKE :q OR p.commercialName LIKE :q', { q: `%${q}%` })
        .take(limit).getMany(),

      this.moleculeRepo.createQueryBuilder('m')
        .select(['m.moleculeId', 'm.name'])
        .where('m.name LIKE :q', { q: `%${q}%` })
        .take(limit).getMany(),

      this.indicationRepo.createQueryBuilder('i')
        .select(['i.indicationId', 'i.name'])
        .where('i.name LIKE :q', { q: `%${q}%` })
        .take(limit).getMany(),

      this.cim10Repo.createQueryBuilder('c')
        .select(['c.cim10Id', 'c.code', 'c.name'])
        .where('c.name LIKE :q OR c.code LIKE :q', { q: `%${q}%` })
        .take(limit).getMany(),
    ]);

    return {
      query: q,
      results: {
        products:    { data: products,    count: products.length },
        molecules:   { data: molecules,   count: molecules.length },
        indications: { data: indications, count: indications.length },
        cim10:       { data: cim10,       count: cim10.length },
      },
      totalResults: products.length + molecules.length + indications.length + cim10.length,
    };
  }

  async autocomplete(q: string, limit = 8) {
    if (!q || q.length < 2) return [];

    const products = await this.productRepo
      .createQueryBuilder('p')
      .select(['p.productId', 'p.name', 'p.shortName'])
      .where('p.name LIKE :q OR p.shortName LIKE :q OR p.commercialName LIKE :q', { q: `%${q}%` })
      .andWhere('p.marketStatus = 1')
      .take(limit)
      .getMany();

    return products.map(p => ({
      id:       p.productId,
      label:    p.name,
      subtitle: p.shortName,
      type:     'drug',
    }));
  }

  async advancedSearch(filters: any) {
    const { name, marketStatus, page = 1, limit = 20 } = filters;
    const qb = this.productRepo.createQueryBuilder('p')
      .select(['p.productId', 'p.name', 'p.shortName', 'p.commercialName', 'p.marketStatus']);

    if (name)         qb.andWhere('p.name LIKE :name', { name: `%${name}%` });
    if (marketStatus) qb.andWhere('p.marketStatus = :ms', { ms: marketStatus });

    qb.orderBy('p.name', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getStats() {
    const [drugs, molecules, indications, cim10] = await Promise.all([
      this.productRepo.createQueryBuilder('p').getCount(),
      this.moleculeRepo.createQueryBuilder('m').getCount(),
      this.indicationRepo.createQueryBuilder('i').getCount(),
      this.cim10Repo.createQueryBuilder('c').getCount(),
    ]);
    return { indexedRecords: { drugs, molecules, indications, cim10 }, total: drugs + molecules + indications + cim10 };
  }
}
