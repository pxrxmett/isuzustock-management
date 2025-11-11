import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandEventsController } from './controllers/brand-events.controller';
import { AdminEventsController } from './controllers/admin-events.controller';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventVehicle } from './entities/event-vehicle.entity';
import { Vehicle } from '../stock/entities/vehicle.entity';
import { Staff } from '../staff/entities/staff.entity';
import { BrandModule } from '../brand/brand.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventVehicle, Vehicle, Staff]),
    BrandModule,
  ],
  controllers: [
    BrandEventsController, // NEW: Path-based routing /:brandCode/events
    AdminEventsController, // NEW: Admin cross-brand access /admin/events
    EventsController, // OLD: Deprecated (kept for backward compatibility)
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
