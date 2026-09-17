import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Préfixe global
  app.setGlobalPrefix('api');

  // Validation automatique des DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Intercepteur de réponse uniforme
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Filtre d'erreurs global
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors();

  // Swagger (documentation API)
  const config = new DocumentBuilder()
    .setTitle('Drug Service API')
    .setDescription('API de gestion des médicaments — MedocCloudNative')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3002);
  console.log('🚀 Drug Service démarré sur http://localhost:3002');
  console.log('📚 Documentation : http://localhost:3002/api/docs');
}
bootstrap();
