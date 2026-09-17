import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ProductModule } from './modules/product/product.module';
import { MoleculeModule } from './modules/molecule/molecule.module';
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [
    // Variables d'environnement
    ConfigModule.forRoot({ isGlobal: true }),

    // Connexion MariaDB
    TypeOrmModule.forRoot(databaseConfig()),

    // Modules métier
    ProductModule,
    MoleculeModule,
    CompanyModule,
  ],
})
export class AppModule {}
