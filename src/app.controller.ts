import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      service: 'Stock Management API',
      version: '1.0.0',
      message: 'Backend is running',
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}
