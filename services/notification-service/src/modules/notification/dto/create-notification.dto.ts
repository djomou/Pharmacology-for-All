import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotifType } from '../entities/notification.entity';
export class CreateNotificationDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber()    userId?:  number;
  @ApiProperty()         @IsString()                  title:    string;
  @ApiProperty()         @IsString()                  message:  string;
  @ApiPropertyOptional({ enum: NotifType })
  @IsOptional() @IsEnum(NotifType)                    type?:    NotifType;
  @ApiPropertyOptional() @IsOptional() @IsString()    link?:    string;
}
