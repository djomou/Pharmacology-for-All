import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForeignProduct } from './entities/foreign-product.entity';
import { Country }        from './entities/country.entity';
import { InternationalController } from './international.controller';
import { InternationalService }    from './international.service';

@Module({
  imports: [TypeOrmModule.forFeature([ForeignProduct, Country])],
  controllers: [InternationalController],
  providers:   [InternationalService],
})
export class InternationalModule {}
