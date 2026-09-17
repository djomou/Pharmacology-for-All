import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Product }    from './entities/product.entity';
import { Indication } from './entities/indication.entity';
import { Molecule }   from './entities/molecule.entity';
import { Warning }    from './entities/warning.entity';
import {
  detectSymptoms,
  SYMPTOM_MAPPINGS,
} from './engine/symptom-keywords.engine';

export interface DrugSuggestion {
  productId:    number;
  name:         string;
  shortName:    string;
  matchedOn:    string;   // Ce qui a déclenché la suggestion
  confidence:   'élevée' | 'modérée' | 'faible';
}

export interface AdvisorResponse {
  sessionId:         string;
  analyzedText:      string;
  detectedSymptoms:  string[];
  suggestions:       DrugSuggestion[];
  warnings:          string[];
  disclaimer:        string;
  emergencyMessage?: string;
  timestamp:         string;
}

@Injectable()
export class AdvisorService {
  constructor(
    @InjectRepository(Product)    private productRepo:    Repository<Product>,
    @InjectRepository(Indication) private indicationRepo: Repository<Indication>,
    @InjectRepository(Molecule)   private moleculeRepo:   Repository<Molecule>,
    @InjectRepository(Warning)    private warningRepo:    Repository<Warning>,
  ) {}

  async analyze(description: string, userId?: number): Promise<AdvisorResponse> {
    const sessionId = `ADV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // ─── 1. Détecter les symptômes ──────────────────────────
    const detectedMappings = detectSymptoms(description);

    if (detectedMappings.length === 0) {
      return {
        sessionId,
        analyzedText:     description,
        detectedSymptoms: [],
        suggestions:      [],
        warnings:         [],
        disclaimer:       this.getDisclaimer(),
        timestamp:        new Date().toISOString(),
      };
    }

    // ─── 2. Vérifier urgence ────────────────────────────────
    const hasHighSeverity = detectedMappings.some(m => m.severity === 'high');
    const emergencyKeywords = [
      'poitrine', 'respirer', 'evanouissement', 'inconscient',
      'sang', 'paralysie', 'convulsion',
    ];
    const descLower = description.toLowerCase();
    const isEmergency = emergencyKeywords.some(k => descLower.includes(k));

    // ─── 3. Chercher les molécules dans la BDD ───────────────
    const allMoleculeTerms = [...new Set(
      detectedMappings.flatMap(m => m.moleculeTerms)
    )];

    const molecules = await this.findMoleculesByNames(allMoleculeTerms);

    // ─── 4. Chercher les médicaments via indications ─────────
    const allSearchTerms = [...new Set(
      detectedMappings.flatMap(m => m.searchTerms)
    )];

    const productsByIndication = await this.findProductsByIndications(allSearchTerms);

    // ─── 5. Chercher les médicaments via molécules ───────────
    const productsByMolecule = await this.findProductsByMoleculeNames(allMoleculeTerms);

    // ─── 6. Fusionner et dédupliquer les suggestions ─────────
    const suggestions = this.buildSuggestions(
      productsByMolecule,
      productsByIndication,
      allMoleculeTerms,
    );

    // ─── 7. Collecter les avertissements ────────────────────
    const warnings = [
      ...new Set(detectedMappings.map(m => m.warningMessage)),
    ];

    return {
      sessionId,
      analyzedText:     description,
      detectedSymptoms: detectedMappings.map(m => m.symptomLabel),
      suggestions:      suggestions.slice(0, 8), // Max 8 suggestions
      warnings,
      disclaimer:       this.getDisclaimer(),
      emergencyMessage: isEmergency
        ? '🚨 Certains symptômes décrits peuvent nécessiter une assistance médicale urgente. Appelez le 15 (SAMU) ou le 18 (Pompiers).'
        : hasHighSeverity
        ? '⚠️ Certains symptômes détectés nécessitent impérativement une consultation médicale.'
        : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── CHERCHER LES MOLÉCULES PAR NOM ──────────────────────
  private async findMoleculesByNames(terms: string[]) {
    if (!terms.length) return [];
    const results = await Promise.all(
      terms.map(term =>
        this.moleculeRepo
          .createQueryBuilder('m')
          .where('LOWER(m.name) LIKE :term', { term: `%${term.toLowerCase()}%` })
          .take(3)
          .getMany()
      )
    );
    return results.flat();
  }

  // ─── CHERCHER LES PRODUITS VIA INDICATIONS ───────────────
  private async findProductsByIndications(searchTerms: string[]) {
    if (!searchTerms.length) return [];
    const indications = await Promise.all(
      searchTerms.map(term =>
        this.indicationRepo
          .createQueryBuilder('i')
          .where('LOWER(i.name) LIKE :term', { term: `%${term.toLowerCase()}%` })
          .take(5)
          .getMany()
      )
    );
    return indications.flat();
  }

  // ─── CHERCHER LES PRODUITS VIA NOMS DE MOLÉCULES ─────────
  private async findProductsByMoleculeNames(moleculeTerms: string[]) {
    if (!moleculeTerms.length) return [];
    const products = await Promise.all(
      moleculeTerms.map(term =>
        this.productRepo
          .createQueryBuilder('p')
          .where(
            'LOWER(p.name) LIKE :term OR LOWER(p.shortName) LIKE :term OR LOWER(p.commercial_name) LIKE :term',
            { term: `%${term.toLowerCase()}%` }
          )
          .andWhere('p.marketStatus = 1')
          .take(3)
          .getMany()
      )
    );
    return products.flat();
  }

  // ─── CONSTRUIRE LES SUGGESTIONS FINALES ──────────────────
  private buildSuggestions(
    byMolecule: Product[],
    byIndication: any[],
    moleculeTerms: string[],
  ): DrugSuggestion[] {
    const seen = new Set<number>();
    const suggestions: DrugSuggestion[] = [];

    // Priorité 1 : correspondance directe molécule → produit
    for (const product of byMolecule) {
      if (seen.has(product.productId)) continue;
      seen.add(product.productId);
      const matchedTerm = moleculeTerms.find(t =>
        product.name?.toLowerCase().includes(t.toLowerCase())
      );
      suggestions.push({
        productId:  product.productId,
        name:       product.name       || 'Nom inconnu',
        shortName:  product.shortName  || product.commercialName || '',
        matchedOn:  matchedTerm        || 'substance active',
        confidence: 'élevée',
      });
    }

    return suggestions;
  }

  // ─── SYMPTÔMES DISPONIBLES (pour l'UI) ───────────────────
  getAvailableSymptoms() {
    return SYMPTOM_MAPPINGS.map(m => ({
      label:    m.symptomLabel,
      keywords: m.keywords.slice(0, 4),
      severity: m.severity,
    }));
  }

  // ─── DISCLAIMER LÉGAL ────────────────────────────────────
  private getDisclaimer(): string {
    return [
      '⚕️  AVERTISSEMENT IMPORTANT :',
      'Les suggestions ci-dessus sont fournies à titre purement indicatif.',
      'Elles ne constituent pas un diagnostic médical ni une prescription.',
      'Consultez toujours un médecin ou un pharmacien avant de prendre',
      'tout médicament. Seul un professionnel de santé peut établir',
      'un diagnostic et vous prescrire un traitement adapté.',
      'En cas d\'urgence, appelez le 15 (SAMU) ou le 18 (Pompiers).',
    ].join(' ');
  }
}
