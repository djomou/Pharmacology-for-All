import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreatePrescriptionDto {
  @ApiProperty()  @IsNumber()            productId:   number;
  @ApiProperty()  @IsString()            productName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dosage?:       string;
  @ApiPropertyOptional() @IsOptional() @IsString() frequency?:    string;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?:    string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?:      string;
  @ApiPropertyOptional() @IsOptional() @IsString() prescribedBy?: string;
}
