import { IsString, IsOptional, IsNumber, IsArray, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ description: 'Message de l\'utilisateur' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber()    userId?:       number;
  @ApiPropertyOptional() @IsOptional() @IsString()    userRole?:     string;
  @ApiPropertyOptional() @IsOptional() @IsString()    userName?:     string;
  @ApiPropertyOptional() @IsOptional() @IsNumber()    conversationId?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray()     history?:      Array<{role:string;content:string}>;
}
