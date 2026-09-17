import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientProfile } from './entities/patient-profile.entity';
import { Prescription }   from './entities/prescription.entity';
import { Favorite }       from './entities/favorite.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientProfile) private profileRepo:      Repository<PatientProfile>,
    @InjectRepository(Prescription)   private prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Favorite)       private favoriteRepo:     Repository<Favorite>,
  ) {}

  // ─── PROFIL ──────────────────────────────────────────────
  async getProfile(userId: number) {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId });
      await this.profileRepo.save(profile);
    }
    return profile;
  }

  async updateProfile(userId: number, dto: Partial<PatientProfile>) {
    await this.getProfile(userId);
    await this.profileRepo.update({ userId }, dto);
    return this.getProfile(userId);
  }

  // ─── ORDONNANCES ─────────────────────────────────────────
  async getMyPrescriptions(userId: number) {
    return this.prescriptionRepo.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async addPrescription(userId: number, dto: CreatePrescriptionDto) {
    const prescription = this.prescriptionRepo.create({ ...dto, userId });
    return this.prescriptionRepo.save(prescription);
  }

  async removePrescription(userId: number, id: number) {
    const p = await this.prescriptionRepo.findOne({ where: { id, userId } });
    if (!p) throw new NotFoundException('Ordonnance introuvable');
    await this.prescriptionRepo.update({ id }, { isActive: false });
    return { message: 'Ordonnance archivée' };
  }

  // ─── FAVORIS ─────────────────────────────────────────────
  async getFavorites(userId: number) {
    return this.favoriteRepo.find({ where: { userId }, order: { addedAt: 'DESC' } });
  }

  async addFavorite(userId: number, productId: number, productName: string) {
    const exists = await this.favoriteRepo.findOne({ where: { userId, productId } });
    if (exists) return exists;
    const fav = this.favoriteRepo.create({ userId, productId, productName });
    return this.favoriteRepo.save(fav);
  }

  async removeFavorite(userId: number, productId: number) {
    await this.favoriteRepo.delete({ userId, productId });
    return { message: 'Retiré des favoris' };
  }
}
