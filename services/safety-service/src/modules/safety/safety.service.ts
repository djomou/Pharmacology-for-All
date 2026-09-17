import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { SideEffect } from './entities/side-effect.entity';
import { Warning }    from './entities/warning.entity';
import { Precaution } from './entities/precaution.entity';

@Injectable()
export class SafetyService {
  constructor(
    @InjectRepository(SideEffect) private seRepo:   Repository<SideEffect>,
    @InjectRepository(Warning)    private warnRepo:  Repository<Warning>,
    @InjectRepository(Precaution) private precRepo:  Repository<Precaution>,
    private readonly dataSource: DataSource,
  ) {}

  async findSideEffects(q?: string, page = 1, limit = 20) {
    const qb = this.seRepo.createQueryBuilder('s').select(['s.sideEffectId', 's.name', 's.apparatusId']);
    if (q && q.trim()) qb.where('s.name LIKE :q', { q: `%${q}%` });
    qb.orderBy('s.name', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit } };
  }

  async findWarnings(q?: string, page = 1, limit = 20) {
    const qb = this.warnRepo.createQueryBuilder('w').select(['w.warningId', 'w.name', 'w.comment']);
    if (q && q.trim()) qb.where('w.name LIKE :q', { q: `%${q}%` });
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit } };
  }

  async findPrecautions(q?: string, page = 1, limit = 20) {
    const qb = this.precRepo.createQueryBuilder('p').select(['p.precautionId', 'p.name', 'p.comment']);
    if (q && q.trim()) qb.where('p.name LIKE :q', { q: `%${q}%` });
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit } };
  }

  // ─── SÉCURITÉ PAR NOM DE MÉDICAMENT ──────────────────────
  async findByDrugName(drugName: string) {
    if (!drugName || drugName.length < 2) {
      return { drugName, sideEffects: [], warnings: [], precautions: [], molecules: [] };
    }

    // 1. Trouver le produit et ses molécules
    const molecules = await this.dataSource.query(`
      SELECT DISTINCT m.moleculeId, m.name AS moleculeName
      FROM product p
      JOIN item i         ON i.productId  = p.productId
      JOIN composition c  ON c.itemId     = i.itemId
      JOIN molecule m     ON m.moleculeId = c.moleculeId
      WHERE p.name LIKE ? OR p.shortName LIKE ? OR p.commercial_name LIKE ?
      LIMIT 10
    `, [`%${drugName}%`, `%${drugName}%`, `%${drugName}%`]);

    // 2. Effets indésirables liés aux molécules (via synonymes ou noms similaires)
    const sideEffects = await this.dataSource.query(`
      SELECT DISTINCT s.sideEffectId, s.name, s.apparatusId
      FROM sideEffect s
      WHERE s.name LIKE ?
        OR EXISTS (
          SELECT 1 FROM molecule m WHERE m.name LIKE ? AND m.name LIKE s.name
        )
      LIMIT 20
    `, [`%${drugName}%`, `%${drugName}%`]);

    // 3. Si des molécules trouvées, chercher side effects par nom de molécule
    let molSideEffects: any[] = [];
    if (molecules.length > 0) {
      for (const mol of molecules.slice(0, 3)) {
        const se = await this.dataSource.query(`
          SELECT DISTINCT s.sideEffectId, s.name, s.apparatusId
          FROM sideEffect s
          WHERE s.name LIKE ?
          LIMIT 10
        `, [`%${mol.moleculeName}%`]);
        molSideEffects = [...molSideEffects, ...se];
      }
    }

    // Fusionner et dédupliquer
    const allSideEffects = [...sideEffects, ...molSideEffects]
      .filter((v, i, arr) => arr.findIndex(x => x.sideEffectId === v.sideEffectId) === i)
      .slice(0, 20);

    // 4. Warnings liés au médicament
    const warnings = await this.dataSource.query(`
      SELECT DISTINCT w.warningId, w.name, w.comment
      FROM warning w
      WHERE w.name LIKE ?
      LIMIT 10
    `, [`%${drugName}%`]);

    // 5. Précautions
    const precautions = await this.dataSource.query(`
      SELECT DISTINCT p.precautionId, p.name, p.comment
      FROM precaution p
      WHERE p.name LIKE ?
      LIMIT 10
    `, [`%${drugName}%`]);

    return {
      drugName,
      molecules,
      sideEffects: allSideEffects,
      warnings,
      precautions,
      totalFound: allSideEffects.length + warnings.length + precautions.length,
    };
  }

  async getStats() {
    const [sideEffects, warnings, precautions] = await Promise.all([
      this.seRepo.createQueryBuilder('s').getCount(),
      this.warnRepo.createQueryBuilder('w').getCount(),
      this.precRepo.createQueryBuilder('p').getCount(),
    ]);
    return { sideEffects, warnings, precautions };
  }
}
