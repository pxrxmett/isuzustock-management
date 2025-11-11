import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from './config/env.validation';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import lineConfig from './config/line.config';
import { StockModule } from './modules/stock/stock.module';
import { TestDriveModule } from './modules/test-drive/test-drive.module';
import { AuthModule } from './modules/auth/auth.module';
import { StaffModule } from './modules/staff/staff.module';
import { LineIntegrationModule } from './modules/line-integration/line-integration.module';
import { EventsModule } from './modules/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BrandModule } from './modules/brand/brand.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}`, // .env.development or .env.production
        '.env.local',
        '.env',
      ],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      load: [databaseConfig, appConfig, jwtConfig, lineConfig],
      validate,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
    }),
    AuthModule,
    UsersModule,
    AnalyticsModule,
    BrandModule,
    StockModule,
    TestDriveModule,
    StaffModule,
    LineIntegrationModule,
    EventsModule,
  ],
})
export class AppModule {}
