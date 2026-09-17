import { IsString, MinLength, MaxLength, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeSymptomsDto {
  @ApiProperty({
    description: 'Description libre des symptômes en français',
    example: 'J\'ai des maux de tête depuis ce matin et un peu de fièvre. Je me sens fatigué.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(10,  { message: 'Veuillez décrire vos symptômes en au moins 10 caractères.' })
  @MaxLength(2000, { message: 'Description trop longue (max 2000 caractères).' })
  description: string;

  @ApiPropertyOptional({ description: 'ID du patient connecté (optionnel)' })
  @IsOptional()
  @IsNumber()
  userId?: number;
}
