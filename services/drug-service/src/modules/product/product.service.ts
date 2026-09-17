import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product }       from './entities/product.entity';
import { DrugMetadata }  from './entities/drug-metadata.entity';
import { SearchProductDto } from './dto/search-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)      private productRepo:  Repository<Product>,
    @InjectRepository(DrugMetadata) private metaRepo:     Repository<DrugMetadata>,
  ) {}

  // ─── LISTE ───────────────────────────────────────────────
  async findAll(query: SearchProductDto) {
    const { q, marketStatus, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const qb = this.productRepo.createQueryBuilder('p')
      .select(['p.productId','p.name','p.shortName','p.commercialName','p.marketStatus','p.type']);
    if (q) qb.where('p.name LIKE :q OR p.shortName LIKE :q OR p.commercialName LIKE :q OR p.cis LIKE :q', { q:`%${q}%` });
    if (marketStatus) qb.andWhere('p.marketStatus = :ms', { ms: marketStatus });
    qb.orderBy('p.name','ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total/limit) } };
  }

  // ─── LISTE ALPHABÉTIQUE POUR CRUD ────────────────────────
  async findAllForCrud(q?: string, limit = 50) {
    const qb = this.productRepo.createQueryBuilder('p')
      .select(['p.productId','p.name','p.shortName','p.commercialName','p.marketStatus']);
    if (q) qb.where('p.name LIKE :q OR p.shortName LIKE :q', { q:`%${q}%` });
    qb.orderBy('p.name','ASC').take(limit);
    return qb.getMany();
  }

  // ─── DÉTAIL ───────────────────────────────────────────────
  async findOne(productId: number) {
    const product = await this.productRepo.createQueryBuilder('p')
      .select(['p.productId','p.name','p.shortName','p.commercialName','p.marketStatus','p.type','p.cis','p.formId','p.companyId','p.genericType','p.drugInSport','p.ald'])
      .where('p.productId = :id', { id: productId })
      .getOne();
    if (!product) throw new NotFoundException(`Médicament #${productId} introuvable`);
    const meta = await this.metaRepo.findOne({ where: { productId } });
    return { ...product, metadata: meta || {} };
  }

  // ─── RECHERCHE ────────────────────────────────────────────
  async search(q: string, limit = 10) {
    return this.productRepo.createQueryBuilder('p')
      .select(['p.productId','p.name','p.shortName','p.commercialName'])
      .where('p.name LIKE :q OR p.shortName LIKE :q OR p.commercialName LIKE :q', { q:`%${q}%` })
      .andWhere('p.marketStatus = 1')
      .orderBy('p.name','ASC').take(limit).getMany();
  }

  // ─── CRÉER ────────────────────────────────────────────────
  async create(dto: CreateProductDto) {
    // Générer un nouvel ID
    const maxId = await this.productRepo.createQueryBuilder('p')
      .select('MAX(p.productId)','max').getRawOne();
    const productId = (parseInt(maxId?.max||'0') || 0) + 1;

    // Créer le produit
    const product = this.productRepo.create({
      productId,
      name:          dto.name,
      shortName:     dto.shortName || dto.name.substring(0, 64),
      commercialName:dto.commercialName,
      marketStatus:  dto.marketStatus ?? 1,
      formId:        dto.formId,
      companyId:     dto.companyId,
      productRangeId:dto.productRangeId,
      commonNameGroupId: dto.commonNameGroupId,
      type:          0,
    });
    await this.productRepo.save(product);

    // Sauvegarder les métadonnées enrichies
    const meta = this.metaRepo.create({
      productId,
      activePrinciples:  dto.activePrinciples,
      excipients:        dto.excipients,
      interactions:      dto.interactions,
      foodInteractions:  dto.foodInteractions,
      posology:          dto.posology,
      indications:       dto.indications,
      cim10:             dto.cim10,
      sideEffects:       dto.sideEffects,
      allergies:         dto.allergies,
      warnings:          dto.warnings,
      precautions:       dto.precautions,
      atcClassification: dto.atcClassification,
      contraindications: dto.contraindications,
      notes:             dto.notes,
    });
    await this.metaRepo.save(meta);

    return { ...product, metadata: meta, message: `Médicament "${dto.name}" créé avec l'ID #${productId}` };
  }

  // ─── MODIFIER ─────────────────────────────────────────────
  async update(productId: number, dto: Partial<CreateProductDto>) {
    await this.findOne(productId);

    // Mettre à jour le produit principal
    const update: Partial<Product> = {};
    if (dto.name)          update.name = dto.name;
    if (dto.shortName)     update.shortName = dto.shortName;
    if (dto.commercialName)update.commercialName = dto.commercialName;
    if (dto.marketStatus !== undefined) update.marketStatus = dto.marketStatus;
    if (Object.keys(update).length > 0)
      await this.productRepo.update({ productId }, update);

    // Mettre à jour/créer les métadonnées
    const metaFields: Partial<DrugMetadata> = {};
    if (dto.activePrinciples  !== undefined) metaFields.activePrinciples  = dto.activePrinciples;
    if (dto.excipients        !== undefined) metaFields.excipients        = dto.excipients;
    if (dto.interactions      !== undefined) metaFields.interactions      = dto.interactions;
    if (dto.foodInteractions  !== undefined) metaFields.foodInteractions  = dto.foodInteractions;
    if (dto.posology          !== undefined) metaFields.posology          = dto.posology;
    if (dto.indications       !== undefined) metaFields.indications       = dto.indications;
    if (dto.cim10             !== undefined) metaFields.cim10             = dto.cim10;
    if (dto.sideEffects       !== undefined) metaFields.sideEffects       = dto.sideEffects;
    if (dto.allergies         !== undefined) metaFields.allergies         = dto.allergies;
    if (dto.warnings          !== undefined) metaFields.warnings          = dto.warnings;
    if (dto.precautions       !== undefined) metaFields.precautions       = dto.precautions;
    if (dto.atcClassification !== undefined) metaFields.atcClassification = dto.atcClassification;
    if (dto.contraindications !== undefined) metaFields.contraindications = dto.contraindications;
    if (dto.notes             !== undefined) metaFields.notes             = dto.notes;

    const existing = await this.metaRepo.findOne({ where: { productId } });
    if (existing) {
      await this.metaRepo.update({ productId }, metaFields);
    } else {
      await this.metaRepo.save(this.metaRepo.create({ productId, ...metaFields }));
    }

    return { ...(await this.findOne(productId)), message: `Médicament #${productId} modifié avec succès` };
  }

  // ─── SUPPRIMER (logique) ──────────────────────────────────
  async remove(productId: number) {
    const product = await this.findOne(productId);
    await this.productRepo.update({ productId }, {
      marketStatus: 5,
    });
    return {
      success: true,
      message: `Médicament "${product.name}" (ID #${productId}) retiré du marché.`,
      productId,
    };
  }

  async getStats() {
    const total  = await this.productRepo.createQueryBuilder('p').getCount();
    const actifs = await this.productRepo.createQueryBuilder('p').where('p.marketStatus = 1').getCount();
    return { total, actifs, retires: total - actifs };
  }
}
