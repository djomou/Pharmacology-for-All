import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entités légères pour le contexte
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('product')
class ProductCtx {
  @PrimaryColumn({ name:'productId' }) productId: number;
  @Column({ nullable:true }) name: string;
  @Column({ name:'shortName', nullable:true }) shortName: string;
  @Column({ nullable:true }) marketStatus: number;
}

@Entity('molecule')
class MoleculeCtx {
  @PrimaryColumn({ name:'moleculeId' }) moleculeId: number;
  @Column({ nullable:true }) name: string;
}

@Entity('indication')
class IndicationCtx {
  @PrimaryColumn({ name:'indicationId' }) indicationId: number;
  @Column({ nullable:true }) name: string;
}

@Entity('sideEffect')
class SideEffectCtx {
  @PrimaryColumn({ name:'sideEffectId' }) sideEffectId: number;
  @Column({ nullable:true }) name: string;
}

@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(ProductCtx)    private prodRepo:  Repository<ProductCtx>,
    @InjectRepository(MoleculeCtx)   private molRepo:   Repository<MoleculeCtx>,
    @InjectRepository(IndicationCtx) private indRepo:   Repository<IndicationCtx>,
    @InjectRepository(SideEffectCtx) private seRepo:    Repository<SideEffectCtx>,
  ) {}

  // Extrait les keywords d'un message
  extractKeywords(text: string): string[] {
    const stopWords = new Set(['le','la','les','de','du','des','un','une','et','est','je','il','elle','nous','vous','ils','elles','mon','ma','mes','ton','ta','tes','son','sa','ses','que','qui','quoi','comment','pourquoi','quand','où','si','pas','ne','plus','très','aussi','mais','ou','donc','car','car','ni','parce','depuis','depuis','avec','sans','pour','sur','sous','dans','entre','vers','avant','après','pendant']);
    return text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9\s]/g,' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .slice(0, 8);
  }

  // Construit le contexte médicamenteux depuis la BDD
  async buildDrugContext(userMessage: string): Promise<string> {
    const keywords = this.extractKeywords(userMessage);
    if (!keywords.length) return '';

    try {
      const contextParts: string[] = [];

      // Chercher des médicaments correspondants
      const drugResults = await Promise.all(
        keywords.slice(0, 4).map(kw =>
          this.prodRepo.createQueryBuilder('p')
            .select(['p.productId','p.name','p.shortName'])
            .where('p.name LIKE :q AND p.marketStatus = 1', { q:`%${kw}%` })
            .take(3)
            .getMany()
        )
      );
      const drugs = [...new Map(
        drugResults.flat().map(d => [d.productId, d])
      ).values()].slice(0, 8);

      // Chercher des molécules
      const molResults = await Promise.all(
        keywords.slice(0, 3).map(kw =>
          this.molRepo.createQueryBuilder('m')
            .select(['m.moleculeId','m.name'])
            .where('m.name LIKE :q', { q:`%${kw}%` })
            .take(4)
            .getMany()
        )
      );
      const mols = [...new Map(
        molResults.flat().map(m => [m.moleculeId, m])
      ).values()].slice(0, 6);

      // Chercher des indications
      const indResults = await Promise.all(
        keywords.slice(0, 3).map(kw =>
          this.indRepo.createQueryBuilder('i')
            .select(['i.indicationId','i.name'])
            .where('i.name LIKE :q', { q:`%${kw}%` })
            .take(3)
            .getMany()
        )
      );
      const inds = [...new Map(
        indResults.flat().map(i => [i.indicationId, i])
      ).values()].slice(0, 5);

      // Chercher effets indésirables
      const seResults = await Promise.all(
        keywords.slice(0, 2).map(kw =>
          this.seRepo.createQueryBuilder('s')
            .select(['s.sideEffectId','s.name'])
            .where('s.name LIKE :q', { q:`%${kw}%` })
            .take(3)
            .getMany()
        )
      );
      const ses = [...new Map(
        seResults.flat().map(s => [s.sideEffectId, s])
      ).values()].slice(0, 4);

      if (drugs.length)  contextParts.push(`MÉDICAMENTS DISPONIBLES DANS LA BASE: ${drugs.map(d=>`${d.name}${d.shortName?` (${d.shortName})`:''}`).join(', ')}`);
      if (mols.length)   contextParts.push(`SUBSTANCES ACTIVES DISPONIBLES: ${mols.map(m=>m.name).join(', ')}`);
      if (inds.length)   contextParts.push(`INDICATIONS LIÉES: ${inds.map(i=>i.name).join(', ')}`);
      if (ses.length)    contextParts.push(`EFFETS INDÉSIRABLES LIÉS: ${ses.map(s=>s.name).join(', ')}`);

      return contextParts.length > 0
        ? `\n\n[DONNÉES BASE MÉDICAMENTEUSE PERTINENTES]\n${contextParts.join('\n')}\n`
        : '';
    } catch { return ''; }
  }

  getExports() {
    return [ProductCtx, MoleculeCtx, IndicationCtx, SideEffectCtx];
  }
}

export { ProductCtx, MoleculeCtx, IndicationCtx, SideEffectCtx };
