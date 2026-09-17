import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Nom du médicament (obligatoire)' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Principes actifs - ex: paracetamol (obligatoire)' })
  @IsString()
  activePrinciples: string;

  @ApiPropertyOptional() @IsOptional() @IsString()  shortName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  commercialName?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber()  marketStatus?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber()  formId?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber()  companyId?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber()  productRangeId?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber()  commonNameGroupId?: number;

  // Champs enrichis (stockés en JSON dans des tables liées)
  @ApiPropertyOptional() @IsOptional() @IsString()  excipients?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  interactions?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  foodInteractions?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  posology?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  indications?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  cim10?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  sideEffects?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  allergies?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  warnings?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  precautions?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  atcClassification?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  contraindications?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  notes?: string;
}
