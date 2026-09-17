import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@ApiTags('Patients & Ordonnances')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // Profil
  @Get(':userId/profile')
  @ApiOperation({ summary: 'Profil patient' })
  getProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.patientService.getProfile(userId);
  }

  @Put(':userId/profile')
  @ApiOperation({ summary: 'Mettre à jour le profil' })
  updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: any,
  ) { return this.patientService.updateProfile(userId, dto); }

  // Ordonnances
  @Get(':userId/prescriptions')
  @ApiOperation({ summary: 'Mes ordonnances actives' })
  getPrescriptions(@Param('userId', ParseIntPipe) userId: number) {
    return this.patientService.getMyPrescriptions(userId);
  }

  @Post(':userId/prescriptions')
  @ApiOperation({ summary: 'Ajouter une ordonnance' })
  addPrescription(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreatePrescriptionDto,
  ) { return this.patientService.addPrescription(userId, dto); }

  @Delete(':userId/prescriptions/:id')
  @ApiOperation({ summary: 'Archiver une ordonnance' })
  removePrescription(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) { return this.patientService.removePrescription(userId, id); }

  // Favoris
  @Get(':userId/favorites')
  @ApiOperation({ summary: 'Mes médicaments favoris' })
  getFavorites(@Param('userId', ParseIntPipe) userId: number) {
    return this.patientService.getFavorites(userId);
  }

  @Post(':userId/favorites')
  @ApiOperation({ summary: 'Ajouter aux favoris' })
  addFavorite(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('productId') productId: number,
    @Body('productName') productName: string,
  ) { return this.patientService.addFavorite(userId, productId, productName); }

  @Delete(':userId/favorites/:productId')
  @ApiOperation({ summary: 'Retirer des favoris' })
  removeFavorite(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) { return this.patientService.removeFavorite(userId, productId); }
}
