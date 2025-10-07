import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // แก้ไขการตั้งค่า CORS เพื่อรองรับทุก frontend และ ngrok
  app.enableCors({
  origin: [
    // Desktop Admin Frontend
    'http://localhost:8000',
    // Mobile Frontend
    'http://localhost:4000',
    // ngrok URL สำหรับทดสอบบนมือถือจริง
    'https://7e9b-2403-6200-8853-56f7-2190-6448-8539-7a2c.ngrok-free.app',
    // เพิ่ม URL ของ ngrok ที่กำลังใช้
    'https://5ec0-2403-6200-8853-476-9569-2f72-985a-c578.ngrok-free.app'
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Authorization']
});

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }));

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

  // Backend ทำงานที่พอร์ต 3000
  const port = 3000;
  await app.listen(port);
  console.log(`Backend API is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap();
