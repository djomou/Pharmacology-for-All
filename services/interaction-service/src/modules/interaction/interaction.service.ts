import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Interaction }          from './entities/interaction.entity';
import { DrugInteractionClass } from './entities/drug-interaction-class.entity';
import { Contraindication }     from './entities/contraindication.entity';
import { Allergy }              from './entities/allergy.entity';

const SEVERITY_LABELS: Record<number, string> = {
  1: 'Précaution',
  2: 'À surveiller',
  3: 'Déconseillé',
  4: 'Contre-indiqué',
  5: 'Formellement contre-indiqué',
};

@Injectable()
export class InteractionService {
  constructor(
    @InjectRepository(Interaction)          private interactionRepo: Repository<Interaction>,
    @InjectRepository(DrugInteractionClass) private dicRepo:         Repository<DrugInteractionClass>,
    @InjectRepository(Contraindication)     private ciRepo:          Repository<Contraindication>,
    @InjectRepository(Allergy)             private allergyRepo:     Repository<Allergy>,
  ) {}

  async searchDrugClasses(query: string) {
    if (!query || query.trim().length === 0) {
      return { data: [], count: 0 };
    }

    try {
      const classes = await this.dicRepo
        .createQueryBuilder('d')
        .select(['d.drugInteractionClassId', 'd.name'])
        .where('LOWER(d.name) LIKE :q', { q: `%${query.toLowerCase()}%` })
        .orderBy('d.name', 'ASC')
        .take(50)
        .getMany();

      return {
        data: classes,
        count: classes.length,
        query: query
      };
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des classes d'interaction: ${error.message}`);
    }
  }

  async checkInteractionsByName(name1: string, name2: string) {
    if (!name1 || !name2) {
      return { name1, name2, interactions: [], count: 0 };
    }

    // 1. Trouver les classes d'interaction correspondant aux deux noms
    const [classes1, classes2] = await Promise.all([
      this.dicRepo.createQueryBuilder('d')
        .where('LOWER(d.name) LIKE :q', { q: `%${name1.toLowerCase()}%` })
        .select(['d.drugInteractionClassId', 'd.name'])
        .getMany(),
      this.dicRepo.createQueryBuilder('d')
        .where('LOWER(d.name) LIKE :q', { q: `%${name2.toLowerCase()}%` })
        .select(['d.drugInteractionClassId', 'd.name'])
        .getMany(),
    ]);

    if (classes1.length === 0 || classes2.length === 0) {
      return {
        name1, name2,
        interactions: [],
        count: 0,
        info: classes1.length === 0
          ? `Aucune classe d'interaction trouvée pour "${name1}"`
          : `Aucune classe d'interaction trouvée pour "${name2}"`,
      };
    }

    const ids1 = classes1.map(c => c.drugInteractionClassId);
    const ids2 = classes2.map(c => c.drugInteractionClassId);

    // 2. Chercher les interactions entre ces classes
    const interactions = await this.interactionRepo
      .createQueryBuilder('i')
      .select(['i.interactionId','i.drugInteractionClassId1','i.drugInteractionClassId2','i.riskComment','i.precautionComment','i.severity'])
      .where(
        '(i.drugInteractionClassId1 IN (:...ids1) AND i.drugInteractionClassId2 IN (:...ids2)) OR (i.drugInteractionClassId1 IN (:...ids2b) AND i.drugInteractionClassId2 IN (:...ids1b))',
        { ids1, ids2, ids1b: ids1, ids2b: ids2 },
      )
      .getMany();

    // 3. Enrichir avec les noms des classes
    const allClassIds = [...new Set([
      ...interactions.map(i => i.drugInteractionClassId1),
      ...interactions.map(i => i.drugInteractionClassId2),
    ])];

    let classMap: Record<number, string> = {};
    if (allClassIds.length > 0) {
      const classes = await this.dicRepo
        .createQueryBuilder('d')
        .select(['d.drugInteractionClassId', 'd.name'])
        .where('d.drugInteractionClassId IN (:...ids)', { ids: allClassIds })
        .getMany();
      classMap = Object.fromEntries(classes.map(c => [c.drugInteractionClassId, c.name]));
    }

    const enriched = interactions.map(i => ({
      interactionId:         i.interactionId,
      drugInteractionClassId1: i.drugInteractionClassId1,
      drugInteractionClassId2: i.drugInteractionClassId2,
      class1Name:            classMap[i.drugInteractionClassId1] || `Classe #${i.drugInteractionClassId1}`,
      class2Name:            classMap[i.drugInteractionClassId2] || `Classe #${i.drugInteractionClassId2}`,
      riskComment:           i.riskComment,
      precautionComment:     i.precautionComment,
      severity:              i.severity,
      severityLabel:         i.severity ? (SEVERITY_LABELS[i.severity] || `Niveau ${i.severity}`) : null,
    }));

    return { name1, name2, interactions: enriched, count: enriched.length };
  }

  async findAllContraindications(q?: string, page = 1, limit = 20) {
    const qb = this.ciRepo.createQueryBuilder('c')
      .select(['c.contraIndicationId', 'c.name', 'c.comment']);
    if (q) qb.where('c.name LIKE :q', { q: `%${q}%` });
    qb.orderBy('c.name', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit } };
  }

  async findAllAllergies(q?: string, page = 1, limit = 20) {
    const qb = this.allergyRepo.createQueryBuilder('a')
      .select(['a.allergyId', 'a.name']);
    if (q) qb.where('a.name LIKE :q', { q: `%${q}%` });
    qb.orderBy('a.name', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit } };
  }

  async getStats() {
    const [interactions, contraindications, allergies, classes] = await Promise.all([
      this.interactionRepo.createQueryBuilder('i').getCount(),
      this.ciRepo.createQueryBuilder('c').getCount(),
      this.allergyRepo.createQueryBuilder('a').getCount(),
      this.dicRepo.createQueryBuilder('d').getCount(),
    ]);
    return { interactions, contraindications, allergies, interactionClasses: classes };
  }
}
