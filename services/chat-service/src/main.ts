import { NestFactory }    from '@nestjs/core';
import { AppModule }      from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist:true, transform:true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('MedocAssistant — Chat IA')
    .setDescription('Assistant médical intelligent alimenté par Qwen2.5')
    .setVersion('1.0').build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(3013);
  console.log('🤖 Chat Service (MedocAssistant) démarré sur http://localhost:3013');
  console.log(`🧠 Modèle: ${process.env.QWEN_MODEL || 'qwen2.5:1.5b'}`);
}
bootstrap();
