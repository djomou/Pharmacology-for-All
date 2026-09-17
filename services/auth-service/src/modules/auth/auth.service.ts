import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Patient } from './entities/patient.entity';
import { Medecin } from './entities/medecin.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)    private userRepo:    Repository<User>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Medecin) private medecinRepo: Repository<Medecin>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Cet email est déjà utilisé');

    // Créer le compte utilisateur principal
    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email:     dto.email,
      password:  hashed,
      firstName: dto.firstName,
      lastName:  dto.lastName,
      role:      (dto.role as UserRole) || UserRole.PATIENT,
    });
    const savedUser = await this.userRepo.save(user);

    // Créer le profil spécialisé selon le rôle
    if (savedUser.role === UserRole.PATIENT) {
      const patient = this.patientRepo.create({
        userId:    savedUser.id,
        firstName: savedUser.firstName,
        lastName:  savedUser.lastName,
        email:     savedUser.email,
      });
      await this.patientRepo.save(patient);
    } else if (savedUser.role === UserRole.MEDECIN) {
      const medecin = this.medecinRepo.create({
        userId:    savedUser.id,
        firstName: savedUser.firstName,
        lastName:  savedUser.lastName,
        email:     savedUser.email,
        speciality: (dto as any).speciality || null,
      });
      await this.medecinRepo.save(medecin);
    }

    const { password, ...result } = savedUser;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user)   throw new UnauthorizedException('Email ou mot de passe incorrect');
    if (!user.isActive) throw new UnauthorizedException('Compte désactivé');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid)  throw new UnauthorizedException('Email ou mot de passe incorrect');

    // Récupérer le profil spécialisé
    let profile: any = null;
    if (user.role === UserRole.PATIENT) {
      profile = await this.patientRepo.findOne({ where: { userId: user.id } });
    } else if (user.role === UserRole.MEDECIN) {
      profile = await this.medecinRepo.findOne({ where: { userId: user.id } });
    }

    const payload = {
      sub:   user.id,
      email: user.email,
      role:  user.role,
      firstName: user.firstName,
      lastName:  user.lastName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id:        user.id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role,
        profile,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    let profile: any = null;
    if (user.role === UserRole.PATIENT) {
      profile = await this.patientRepo.findOne({ where: { userId } });
    } else if (user.role === UserRole.MEDECIN) {
      profile = await this.medecinRepo.findOne({ where: { userId } });
    }

    const { password, ...result } = user;
    return { ...result, profile };
  }

  async getAllPatients() {
    return this.patientRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getAllMedecins() {
    return this.medecinRepo.find({ order: { createdAt: 'DESC' } });
  }
}
