import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database/database.config';
import { validate } from './config/env.validation';
import { StockModule } from './modules/stock/stock.module';
import { TestDriveModule } from './modules/test-drive/test-drive.module';
import { AuthModule } from './modules/auth/auth.module';
import { StaffModule } from './modules/staff/staff.module';
import { LineIntegrationModule } from './modules/line-integration/line-integration.module';
import { EventsModule } from './modules/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AnalyticsModule,
    StockModule,
    TestDriveModule,
    StaffModule,
    LineIntegrationModule,
    EventsModule,
  ],
})
export class AppModule {}
