import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product }          from './entities/product.entity';
import { DrugMetadata }     from './entities/drug-metadata.entity';
import { ProductController } from './product.controller';
import { ProductService }    from './product.service';
import { EcosystemModule }   from '../ecosystem/ecosystem.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, DrugMetadata]),
    EcosystemModule,
  ],
  controllers: [ProductController],
  providers:   [ProductService],
  exports:     [ProductService],
})
export class ProductModule {}
