import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database/database.config';
import { StockModule } from './modules/stock/stock.module';
import { TestDriveModule } from './modules/test-drive/test-drive.module';
import { AuthModule } from './modules/auth/auth.module';
import { StaffModule } from './modules/staff/staff.module';
import { LineIntegrationModule } from './modules/line-integration/line-integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'], // สำหรับ local development
      ignoreEnvFile: process.env.NODE_ENV === 'production', // บน Railway ให้ใช้ ENV variables แทน
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    StockModule, 
    TestDriveModule,
    StaffModule,
    LineIntegrationModule,
  ],
})
export class AppModule {}
