import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document }  from './entities/document.entity';
import { Image }     from './entities/image.entity';
import { Reco }      from './entities/reco.entity';
import { DocumentController } from './document.controller';
import { DocumentService }    from './document.service';
@Module({
  imports: [TypeOrmModule.forFeature([Document, Image, Reco])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
