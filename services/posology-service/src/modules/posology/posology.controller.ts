import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PosologyService } from './posology.service';

@ApiTags('Posologies')
@Controller('posologies')
export class PosologyController {
  constructor(private readonly posologyService: PosologyService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques posologies' })
  getStats() { return this.posologyService.getStats(); }

  @Get('units')
  @ApiOperation({ summary: 'Toutes les unités de dosage' })
  findUnits() { return this.posologyService.findAllUnits(); }

  @Get('phases')
  @ApiOperation({ summary: 'Toutes les phases de traitement' })
  findPhases() { return this.posologyService.findAllPhases(); }

  @Get('amm/:ammId')
  @ApiOperation({ summary: 'Posologies par AMM' })
  findByAmm(@Param('ammId', ParseIntPipe) ammId: number) {
    return this.posologyService.findByProduct(ammId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail posologie' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.posologyService.findOne(id);
  }
}
