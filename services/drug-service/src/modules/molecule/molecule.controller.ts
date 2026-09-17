import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MoleculeService } from './molecule.service';

@ApiTags('Molécules / Substances actives')
@Controller('molecules')
export class MoleculeController {
  constructor(private readonly moleculeService: MoleculeService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les molécules' })
  findAll(
    @Query('q') q: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.moleculeService.findAll(q, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Recherche rapide de molécule' })
  search(@Query('q') q: string) {
    return this.moleculeService.search(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une molécule' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moleculeService.findOne(id);
  }
}
