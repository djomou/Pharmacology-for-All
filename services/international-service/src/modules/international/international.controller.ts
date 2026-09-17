import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InternationalService } from './international.service';

@ApiTags('Équivalences Internationales')
@Controller('international')
export class InternationalController {
  constructor(private readonly internationalService: InternationalService) {}

  @Get('stats')
  getStats() { return this.internationalService.getStats(); }

  @Get('countries')
  @ApiOperation({ summary: 'Liste des pays' })
  getCountries() { return this.internationalService.findAllCountries(); }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher par nom de médicament' })
  searchByName(@Query('q') q: string, @Query('page') page: number) {
    return this.internationalService.searchByDrugName(q, page);
  }

  @Get('equivalents/:id')
  @ApiOperation({ summary: 'Équivalents par ID foreignproduct' })
  getEquivalents(@Param('id', ParseIntPipe) id: number) {
    return this.internationalService.findEquivalents(id);
  }

  @Get('country/:countryId')
  @ApiOperation({ summary: 'Médicaments par pays (ID)' })
  getByCountry(
    @Param('countryId', ParseIntPipe) countryId: number,
    @Query('q') q: string,
    @Query('page') page: number,
  ) { return this.internationalService.searchByCountry(countryId, q, page); }
}
