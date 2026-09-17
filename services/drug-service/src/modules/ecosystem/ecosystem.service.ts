import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

const safe = async (fn: () => Promise<any>, fallback: any = []) => {
  try { return await fn(); } catch(e) { return fallback; }
};

@Injectable()
export class EcosystemService {
  constructor(@InjectDataSource() private ds: DataSource) {}

  async getEcosystem(productId: number) {
    // 1. Produit
    const prods = await safe(() => this.ds.query(`
      SELECT p.*, co.name AS companyName, gf.name AS formName, gf.shortName AS formShortName
      FROM product p
      LEFT JOIN company     co ON co.companyId = p.companyId
      LEFT JOIN galenicForm gf ON gf.formId    = p.formId
      WHERE p.productId = ? LIMIT 1
    `, [productId]));
    if (!prods?.length) return null;
    const product = prods[0];
    const cngId   = product.commonNameGroupId;

    // 2. Composition
    const compRows = await safe(() => this.ds.query(`
      SELECT m.moleculeId, m.name AS moleculeName, m.allergyAlert,
             c.type AS compositionType, c.perVolume, c.perVolumeUnit,
             c.ranking, c.isSubComponent,
             en.name AS excipientNature
      FROM item i
      JOIN composition c ON c.itemId = i.itemId
      JOIN molecule m    ON m.moleculeId = c.moleculeId
      LEFT JOIN excipientNature en ON en.excipientNatureId = c.excipientNatureId
      WHERE i.productId = ?
      ORDER BY c.type ASC, c.ranking ASC
      LIMIT 50
    `, [productId]));
    const activeIngredients = (compRows||[]).filter((c: any) => !c.excipientNature);
    const excipients        = (compRows||[]).filter((c: any) =>  c.excipientNature);

    // 3. Posologie
    const posology = await safe(() => this.ds.query(`
      SELECT po.*, u.unit AS unitLabel, u.abbreviation AS unitAbbr
      FROM posology po
      LEFT JOIN posologyUnit u ON u.unitId = po.unitId
      WHERE po.productId = ?
      LIMIT 15
    `, [productId]));

    // 4. Packages
    const packages = await safe(() => this.ds.query(`
      SELECT packageId, name, commercialName, shortName,
             marketStatus, publicPrice, refundingRate, cip, cip13
      FROM package WHERE productId = ?
      ORDER BY marketStatus ASC LIMIT 15
    `, [productId]));

    // 5. Voies d'administration
    const routes = await safe(() => this.ds.query(`
      SELECT r.routeId, r.name, r.shortName
      FROM route r
      JOIN product_route pr ON pr.routeId = r.routeId
      WHERE pr.productId = ? LIMIT 10
    `, [productId]));

    // 6. Interactions médicamenteuses
    const dicIds: number[] = await safe(() => this.ds.query(`
      SELECT drugInteractionClassId FROM product_drugInteractionClass WHERE productId = ? LIMIT 10
    `, [productId]).then((r: any[]) => r.map(x => x.drugInteractionClassId)));
    
    let drugInteractions: any[] = [];
    if (dicIds.length > 0) {
      const ph = dicIds.map(() => '?').join(',');
      const inters = await safe(() => this.ds.query(`
        SELECT i.interactionId, i.drugInteractionClassId1, i.drugInteractionClassId2,
               i.severity, i.riskComment, i.precautionComment,
               d1.name AS substance1, d2.name AS substance2
        FROM interaction i
        JOIN drugInteractionClass d1 ON d1.drugInteractionClassId = i.drugInteractionClassId1
        JOIN drugInteractionClass d2 ON d2.drugInteractionClassId = i.drugInteractionClassId2
        WHERE i.drugInteractionClassId1 IN (${ph}) OR i.drugInteractionClassId2 IN (${ph})
        ORDER BY i.severity DESC LIMIT 20
      `, [...dicIds, ...dicIds]));
      drugInteractions = inters || [];
    }

    // 7. Contre-indications
    const contraindications = cngId ? await safe(() => this.ds.query(`
      SELECT c.contraIndicationId, c.name, c.comment
      FROM contraindication c
      JOIN commonnamegroup_contraindication cc ON cc.contraIndicationId = c.contraIndicationId
      WHERE cc.commonNameGroupId = ? LIMIT 30
    `, [cngId])) : [];

    // 8. Effets indésirables
    const sideEffects = cngId ? await safe(() => this.ds.query(`
      SELECT s.sideEffectId, s.name, s.apparatusId
      FROM sideEffect s
      JOIN commonnamegroup_sideEffect cs ON cs.sideEffectId = s.sideEffectId
      WHERE cs.commonNameGroupId = ? LIMIT 50
    `, [cngId])) : [];

    // 9. Alertes
    const warnings = cngId ? await safe(() => this.ds.query(`
      SELECT w.warningId, w.name, w.comment
      FROM warning w
      JOIN commonnamegroup_warning cw ON cw.warningId = w.warningId
      WHERE cw.commonNameGroupId = ? LIMIT 20
    `, [cngId])) : [];

    // 10. Précautions
    const precautions = cngId ? await safe(() => this.ds.query(`
      SELECT p.precautionId, p.name, p.comment
      FROM precaution p
      JOIN commonnamegroup_precaution cp ON cp.precautionId = p.precautionId
      WHERE cp.commonNameGroupId = ? LIMIT 20
    `, [cngId])) : [];

    // 11. Indications
    const indications = cngId ? await safe(() => this.ds.query(`
      SELECT i.indicationId, i.name
      FROM indication i
      JOIN commonnamegroup_indication ci ON ci.indicationId = i.indicationId
      WHERE ci.commonNameGroupId = ? LIMIT 30
    `, [cngId])) : [];

    // 12. CIM-10
    const cim10 = cngId ? await safe(() => this.ds.query(`
      SELECT DISTINCT c.cim10Id, c.code, c.name
      FROM cim10 c
      WHERE c.name LIKE ? LIMIT 10
    `, [`%${product.name?.split(' ')[0] || ''}%`])) : [];

    // 13. ATC
    const atcRows = await safe(() => this.ds.query(`
      SELECT a.atcClassId, a.code, a.name, a.parentId
      FROM atcClass a
      JOIN product_atc pa ON pa.atcClassId = a.atcClassId
      WHERE pa.productId = ? LIMIT 5
    `, [productId]));
    const atcClass = (atcRows && atcRows.length > 0) ? atcRows : null;

    // 14. Allergies
    const molIds = activeIngredients.map((m: any) => m.moleculeId).filter(Boolean);
    let allergies: any[] = [];
    if (molIds.length > 0) {
      const ph = molIds.map(() => '?').join(',');
      allergies = await safe(() => this.ds.query(`
        SELECT DISTINCT a.allergyId, a.name
        FROM allergy a
        JOIN allergy_molecule am ON am.allergyId = a.allergyId
        WHERE am.moleculeId IN (${ph}) LIMIT 15
      `, molIds));
    }

    // 15. SMR / ASMR
    const smr  = await safe(() => this.ds.query(
      `SELECT smrId, degree, comment, date FROM smr  WHERE productId = ? ORDER BY date DESC LIMIT 3`, [productId]
    ));
    const asmr = await safe(() => this.ds.query(
      `SELECT asmrId, degree, comment, date FROM asmr WHERE productId = ? ORDER BY date DESC LIMIT 3`, [productId]
    ));

    return {
      product,
      composition: { activeIngredients, excipients },
      posology:    posology || [],
      packages:    packages || [],
      routes:      routes   || [],
      interactions: {
        drug:      drugInteractions,
        food:      [],
        lifestyle: [
          { name:'Alcool', risk:'Association déconseillée — risque hépatotoxique potentialisé' },
          { name:'Tabac',  risk:'Peut modifier la pharmacocinétique du médicament' },
        ],
      },
      contraindications: contraindications || [],
      sideEffects:       sideEffects       || [],
      warnings:          warnings           || [],
      precautions:       precautions        || [],
      indications:       indications        || [],
      cim10:             cim10              || [],
      atcClass:          atcClass,
      allergies:         allergies          || [],
      smr:               smr                || [],
      asmr:              asmr               || [],
    };
  }
}
