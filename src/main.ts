import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Inventory Management API')
    .setDescription('API for managing inventory in a multi-tenant ERP system')
    .setVersion('1.0')
    .addTag('Products')
    .addTag('Categories')
    .addTag('Suppliers')
    .addTag('Tenants')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app as unknown as INestApplication,
    swaggerConfig,
  );
  SwaggerModule.setup('api', app as unknown as INestApplication, document);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});
