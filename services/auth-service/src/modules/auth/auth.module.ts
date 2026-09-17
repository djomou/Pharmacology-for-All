import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User }    from './entities/user.entity';
import { Patient } from './entities/patient.entity';
import { Medecin } from './entities/medecin.entity';
import { AuthController } from './auth.controller';
import { AuthService }    from './auth.service';
import { JwtStrategy }    from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Patient, Medecin]),
    PassportModule,
    JwtModule.register({
      secret:       process.env.JWT_SECRET || 'medoc_secret_key_2026',
      signOptions:  { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy],
  exports:     [AuthService, JwtModule],
})
export class AuthModule {}
