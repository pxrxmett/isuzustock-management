// Fix crypto.randomUUID สำหรับ Railway/Production
import { randomUUID } from 'crypto';
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = { randomUUID };
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';
  
  // CORS Configuration - ต้องอยู่ก่อน setGlobalPrefix
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:4000',
    'https://testdrive-liff-app-production.up.railway.app',
    'http://testdrive-liff-app-production.up.railway.app'
  ];

  if (process.env.FRONTEND_URL) {
    const frontendUrl = process.env.FRONTEND_URL;
    allowedOrigins.push(frontendUrl);
    
    if (frontendUrl.startsWith('https://')) {
      allowedOrigins.push(frontendUrl.replace('https://', 'http://'));
    } else if (frontendUrl.startsWith('http://')) {
      allowedOrigins.push(frontendUrl.replace('http://', 'https://'));
    }
  }

  console.log('=== CORS Configuration ===');
  console.log('Allowed Origins:', allowedOrigins);
  console.log('========================');

  // Enable CORS with OPTIONS support
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
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

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  // Log URLs based on environment
  console.log('');
  console.log('================================');
  if (isProduction) {
    console.log('🚀 Backend API is running in PRODUCTION');
    console.log('📡 Internal port:', port);
    console.log('🌐 Public URL: https://isuzu-liff.up.railway.app');
    console.log('📄 Swagger: https://isuzu-liff.up.railway.app/docs');
    console.log('🔗 API Base: https://isuzu-liff.up.railway.app/api');
  } else {
    console.log('🚀 Backend API is running in DEVELOPMENT');
    console.log('📡 Local: http://localhost:' + port);
    console.log('📄 Swagger: http://localhost:' + port + '/docs');
    console.log('🔗 API Base: http://localhost:' + port + '/api');
  }
  console.log('================================');
  console.log('');
}

bootstrap();
