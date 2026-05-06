import { LoggerService } from '@app/logger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new LoggerService();
  const listenPort = process.env.APP_PORT || 3000;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  app.set('trust proxy', true);

  app.use(helmet());

  app.useBodyParser('json', { limit: '5mb' });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Agro Brain')
    .setDescription('Tech Test API Docs')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication and password management')
    .addTag('Farm Owner', 'Farm owner management')
    .addTag('Farm Property', 'Farm property management')
    .addTag('Farm Harvest', 'Farm harvest management')
    .addTag('Farm Crops', 'Farm crops management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'JWT access token issued by POST /auth',
      },
      'bearer',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.enableShutdownHooks();

  await app.listen(listenPort);
  logger.log(`[APP] - BOOTSTRAP - PORT: ${listenPort}`);
}

bootstrap();
