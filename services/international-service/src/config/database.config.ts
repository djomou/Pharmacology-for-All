import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER || 'vxp_user',
  password: process.env.DB_PASSWORD || 'VxpPassword123!',
  database: process.env.DB_NAME || 'vxp',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, charset: 'utf8mb4',
});
