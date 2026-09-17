import {
  Controller, Get, Post, Put, Delete,
  Param, Query, Body, ParseIntPipe, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductService }   from './product.service';
import { EcosystemService } from '../ecosystem/ecosystem.service';
import { SearchProductDto } from './dto/search-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('Médicaments')
@Controller('drugs')
export class ProductController {
  constructor(
    private readonly productService:   ProductService,
    private readonly ecosystemService: EcosystemService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lister / rechercher les médicaments' })
  findAll(@Query() q: SearchProductDto) { return this.productService.findAll(q); }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales' })
  getStats() { return this.productService.getStats(); }

  @Get('crud-list')
  @ApiOperation({ summary: 'Liste alphabétique pour CRUD' })
  crudList(@Query('q') q: string, @Query('limit') limit: number) {
    return this.productService.findAllForCrud(q, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Autocomplete' })
  search(@Query('q') q: string, @Query('limit') limit: number) {
    return this.productService.search(q, limit);
  }

  @Get(':id/ecosystem')
  @ApiOperation({ summary: 'Écosystème complet d\'un médicament' })
  async getEcosystem(@Param('id', ParseIntPipe) id: number) {
    const eco = await this.ecosystemService.getEcosystem(id);
    if (!eco) throw new NotFoundException(`Médicament #${id} introuvable`);
    return eco;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fiche détail' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.productService.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Créer un médicament' })
  create(@Body() dto: CreateProductDto) { return this.productService.create(dto); }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un médicament' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Retirer du marché' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.productService.remove(id); }
}
