import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SideEffect } from './entities/side-effect.entity';
import { Warning } from './entities/warning.entity';
import { Precaution } from './entities/precaution.entity';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';
@Module({
  imports: [TypeOrmModule.forFeature([SideEffect, Warning, Precaution])],
  controllers: [SafetyController],
  providers: [SafetyService],
})
export class SafetyModule {}
