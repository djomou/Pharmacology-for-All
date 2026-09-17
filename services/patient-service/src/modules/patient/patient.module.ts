import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientProfile } from './entities/patient-profile.entity';
import { Prescription }   from './entities/prescription.entity';
import { Favorite }       from './entities/favorite.entity';
import { PatientController } from './patient.controller';
import { PatientService }    from './patient.service';
@Module({
  imports: [TypeOrmModule.forFeature([PatientProfile, Prescription, Favorite])],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
