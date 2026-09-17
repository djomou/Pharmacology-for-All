import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSearch }    from './entities/product-search.entity';
import { MoleculeSearch }   from './entities/molecule-search.entity';
import { IndicationSearch } from './entities/indication-search.entity';
import { Cim10Search }      from './entities/cim10-search.entity';
import { SearchController } from './search.controller';
import { SearchService }    from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    ProductSearch, MoleculeSearch, IndicationSearch, Cim10Search,
  ])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
