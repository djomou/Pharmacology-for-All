import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IndicationService } from './indication.service';

@ApiTags('Indications & Classifications')
@Controller('indications')
export class IndicationController {
  constructor(private readonly indicationService: IndicationService) {}

  @Get('stats')
  getStats() { return this.indicationService.getStats(); }

  @Get('drugs')
  @ApiOperation({ summary: 'Médicaments utilisés pour une indication/maladie' })
  getDrugsByIndication(
    @Query('q') q: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) { return this.indicationService.searchDrugsByIndication(q, page, limit); }

  @Get('cim10')
  searchCim10(@Query('q') q: string, @Query('page') page: number) {
    return this.indicationService.searchCim10(q, page);
  }

  @Get('atc')
  searchAtc(@Query('q') q: string, @Query('page') page: number) {
    return this.indicationService.searchAtc(q, page);
  }

  @Get('atc/:code')
  getAtc(@Param('code') code: string) {
    return this.indicationService.getAtcByCode(code);
  }

  @Get()
  search(@Query('q') q: string, @Query('page') page: number) {
    return this.indicationService.searchIndications(q, page);
  }
}
