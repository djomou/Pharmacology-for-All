import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InteractionService } from './interaction.service';

@ApiTags('Interactions & Contre-indications')
@Controller('interactions')
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques' })
  getStats() { return this.interactionService.getStats(); }

  @Get('check')
  @ApiOperation({ summary: 'Vérifier interaction entre 2 substances par nom' })
  check(@Query('name1') name1: string, @Query('name2') name2: string) {
    return this.interactionService.checkInteractionsByName(name1 || '', name2 || '');
  }

  @Get('classes')
  @ApiOperation({ summary: 'Rechercher des classes d\'interaction' })
  searchClasses(@Query('q') q: string) {
    return this.interactionService.searchDrugClasses(q || '');
  }

  @Get('contraindications')
  @ApiOperation({ summary: 'Liste des contre-indications' })
  findCI(@Query('q') q: string, @Query('page') page: number) {
    return this.interactionService.findAllContraindications(q, page);
  }

  @Get('allergies')
  @ApiOperation({ summary: 'Liste des allergies' })
  findAllergies(@Query('q') q: string, @Query('page') page: number) {
    return this.interactionService.findAllAllergies(q, page);
  }
}
