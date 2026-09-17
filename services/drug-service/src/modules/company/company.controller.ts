import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompanyService } from './company.service';

@ApiTags('Laboratoires')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les laboratoires' })
  findAll(@Query('q') q: string, @Query('page') page: number) {
    return this.companyService.findAll(q, page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un laboratoire' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findOne(id);
  }
}
