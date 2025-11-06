import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { Vehicle } from '../stock/entities/vehicle.entity';
import { Event } from '../events/entities/event.entity';
import { TestDrive } from '../test-drive/entities/test-drive.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Event, TestDrive])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
