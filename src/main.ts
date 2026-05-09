import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Inventário de Valkaria - RPG Backend')
    .setDescription('Sistema de gerenciamento de mesas e fichas de RPG com suporte a múltiplos sistemas')
    .setVersion('1.0.0')
    .setContact('Support', '', 'support@valkaria.local')
    .setLicense('MIT', '')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access_token',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('User', 'User management')
    .addTag('Table', 'Table management')
    .addTag('RPG System', 'RPG system definitions (attributes, skills, classes, races)')
    .addTag('Character Sheet', 'Character sheet operations (CRUD, multiclass, items, effects)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
