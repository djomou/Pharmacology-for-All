import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentService } from './document.service';

@ApiTags('Documents & Médias')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('stats')
  getStats() { return this.documentService.getStats(); }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Documents d\'un médicament' })
  byProduct(@Param('productId', ParseIntPipe) id: number) {
    return this.documentService.findDocumentsByProduct(id);
  }

  @Get('images')
  @ApiOperation({ summary: 'Toutes les images' })
  images(@Query('page') page: number) {
    return this.documentService.findAllImages(page);
  }

  @Get('recos')
  @ApiOperation({ summary: 'Recommandations officielles' })
  recos(@Query('page') page: number) {
    return this.documentService.findAllRecos(page);
  }
}
