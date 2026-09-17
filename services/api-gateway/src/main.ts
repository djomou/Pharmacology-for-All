import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // bodyParser: false — CRITIQUE pour que le proxy transmette le body intact
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const config = new DocumentBuilder()
    .setTitle('MedocCloudNative — API Gateway')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(3000, '0.0.0.0');
  console.log('🚦 API Gateway : http://0.0.0.0:3000');
}
bootstrap();
