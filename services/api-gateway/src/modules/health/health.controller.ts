import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SetMetadata } from '@nestjs/common';
import { SERVICES_CONFIG } from '../../config/services.config';

export const Public = () => SetMetadata('isPublic', true);

@ApiTags('Health & Status')
@Controller()
export class HealthController {

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Statut de l\'API Gateway' })
  health() {
    return {
      status: 'OK',
      service: 'API Gateway — MedocCloudNative',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('services')
  @Public()
  getServices() {
    return {
      total: SERVICES_CONFIG.length,
      services: SERVICES_CONFIG.map(s => ({
        name: s.name,
        prefix: s.prefix,
        description: s.description,
        public: s.public,
      })),
    };
  }

  @Get('routes')
  @Public()
  getRoutes() {
    return SERVICES_CONFIG.map(s => ({
      prefix: s.prefix + '/*',
      target: s.url,
      auth: s.public ? 'Optionnel' : 'JWT requis',
    }));
  }
}
