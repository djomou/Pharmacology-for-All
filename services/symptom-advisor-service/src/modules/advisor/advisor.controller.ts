import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdvisorService } from './advisor.service';
import { AnalyzeSymptomsDto } from './dto/analyze-symptoms.dto';

@ApiTags('Conseiller Symptômes (IA Simulée)')
@Controller('advisor')
export class AdvisorController {
  constructor(private readonly advisorService: AdvisorService) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyser les symptômes et suggérer des médicaments',
    description: `
      Analyse la description libre des symptômes du patient
      et retourne des suggestions de médicaments issues de la base VXP.
      ⚕️ À titre indicatif uniquement — pas un diagnostic médical.
    `,
  })
  @ApiResponse({ status: 201, description: 'Analyse effectuée avec suggestions.' })
  analyze(@Body() dto: AnalyzeSymptomsDto) {
    return this.advisorService.analyze(dto.description, dto.userId);
  }

  @Get('symptoms')
  @ApiOperation({
    summary: 'Liste des symptômes reconnus par le conseiller',
    description: 'Retourne tous les symptômes que le moteur peut analyser.',
  })
  getSymptoms() {
    return this.advisorService.getAvailableSymptoms();
  }
}
