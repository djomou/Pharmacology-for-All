import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Recherche full-text')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des index de recherche' })
  getStats() { return this.searchService.getStats(); }

  @Get()
  @ApiOperation({ summary: 'Recherche globale — toutes catégories' })
  @ApiQuery({ name: 'q', description: 'Terme recherché (min 2 caractères)' })
  globalSearch(@Query('q') q: string, @Query('limit') limit: number) {
    return this.searchService.globalSearch(q, limit);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Suggestions autocomplete rapides' })
  autocomplete(@Query('q') q: string) {
    return this.searchService.autocomplete(q);
  }

  @Get('advanced')
  @ApiOperation({ summary: 'Recherche avancée avec filtres multiples' })
  advanced(
    @Query('name')         name: string,
    @Query('marketStatus') marketStatus: number,
    @Query('page')         page: number,
    @Query('limit')        limit: number,
  ) {
    return this.searchService.advancedSearch({ name, marketStatus, page, limit });
  }
}
