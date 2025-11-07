// Fix crypto.randomUUID สำหรับ Railway/Production
import { randomUUID } from 'crypto';
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = { randomUUID };
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { validateEnvironment } from './config/env.validation';
import { DataSource } from 'typeorm';

async function bootstrap() {
  // Validate environment variables BEFORE creating app
  validateEnvironment();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get configuration from ConfigService with fallbacks
  const port = configService.get<number>('app.port') || 3000;
  const nodeEnv = configService.get<string>('app.nodeEnv') || 'development';
  const corsOrigins = configService.get<string[]>('app.corsOrigins') || ['http://localhost:3000'];
  const isProduction = nodeEnv === 'production';

  // Run database migrations automatically in production
  if (isProduction) {
    try {
      console.log('🔄 Running database migrations...');
      const dataSource = app.get(DataSource);
      await dataSource.runMigrations();
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      // Continue anyway - migrations might already be applied
    }
  }

  // CRITICAL: Add raw HTTP handler for Railway health check at root
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'Stock Management API',
      environment: nodeEnv,
      timestamp: new Date().toISOString()
    });
  });
  expressApp.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      environment: nodeEnv,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // CORS Configuration (dynamic based on environment)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      const isAllowed = corsOrigins.some((allowed) =>
        origin.startsWith(allowed) || allowed.startsWith(origin)
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'Origin'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }));

  // Apply global transform interceptor for camelCase consistency
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Stock Management API')
    .setDescription('API documentation for Stock Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('vehicles', 'Vehicle management')
    .addTag('test-drives', 'Test drive management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start server on Railway's port (0.0.0.0 for Railway)
  await app.listen(port, '0.0.0.0');

  // Pretty startup logs
  console.log('');
  console.log('==========================================================');
  console.log(`🚀 Application is running in ${nodeEnv.toUpperCase()} mode`);
  console.log(`📍 Server: http://localhost:${port}`);
  console.log(`📡 API Endpoint: http://localhost:${port}/api`);
  console.log(`📄 Swagger Docs: http://localhost:${port}/docs`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`🌐 CORS Origins: ${corsOrigins.join(', ')}`);
  console.log('==========================================================');
  console.log('');
}

bootstrap();
