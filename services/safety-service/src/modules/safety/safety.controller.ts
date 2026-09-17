import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SafetyService } from './safety.service';

@ApiTags('Sécurité & Pharmacovigilance')
@Controller('safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Get('stats')
  getStats() { return this.safetyService.getStats(); }

  @Get('by-drug')
  @ApiOperation({ summary: 'Effets indésirables, alertes et précautions par médicament' })
  byDrug(@Query('name') name: string) {
    return this.safetyService.findByDrugName(name);
  }

  @Get('side-effects')
  findSE(@Query('q') q: string, @Query('page') p: number) {
    return this.safetyService.findSideEffects(q, p);
  }

  @Get('warnings')
  findW(@Query('q') q: string, @Query('page') p: number) {
    return this.safetyService.findWarnings(q, p);
  }

  @Get('precautions')
  findP(@Query('q') q: string, @Query('page') p: number) {
    return this.safetyService.findPrecautions(q, p);
  }
}
