import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Image }    from './entities/image.entity';
import { Reco }     from './entities/reco.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document) private docRepo:  Repository<Document>,
    @InjectRepository(Image)    private imgRepo:  Repository<Image>,
    @InjectRepository(Reco)     private recoRepo: Repository<Reco>,
  ) {}

  async findDocumentsByProduct(productId: number) {
    const docs = await this.docRepo.find({ where: { productId }, order: { date: 'DESC' } });
    return { productId, documents: docs, count: docs.length };
  }

  async findAllImages(page = 1, limit = 20) {
    const [data, total] = await this.imgRepo.findAndCount({
      skip: (page - 1) * limit, take: limit,
    });
    return { data, pagination: { total, page, limit } };
  }

  async findAllRecos(page = 1, limit = 20) {
    const [data, total] = await this.recoRepo.findAndCount({
      skip: (page - 1) * limit, take: limit, order: { date: 'DESC' },
    });
    return { data, pagination: { total, page, limit } };
  }

  async getStats() {
    return {
      documents: await this.docRepo.count(),
      images:    await this.imgRepo.count(),
      recos:     await this.recoRepo.count(),
    };
  }
}
