import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interaction }          from './entities/interaction.entity';
import { DrugInteractionClass } from './entities/drug-interaction-class.entity';
import { Contraindication }     from './entities/contraindication.entity';
import { Allergy }              from './entities/allergy.entity';
import { InteractionController } from './interaction.controller';
import { InteractionService }    from './interaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Interaction, DrugInteractionClass, Contraindication, Allergy
  ])],
  controllers: [InteractionController],
  providers:   [InteractionService],
})
export class InteractionModule {}
