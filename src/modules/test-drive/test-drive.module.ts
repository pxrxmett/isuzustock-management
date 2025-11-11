import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandTestDriveController } from './controllers/brand-test-drive.controller';
import { AdminTestDriveController } from './controllers/admin-test-drive.controller';
import { TestDriveController } from './controllers/test-drive.controller';
import { TestDriveService } from './services/test-drive.service';
import { TestDrive } from './entities/test-drive.entity';
import { Vehicle } from '../stock/entities/vehicle.entity';
import { Staff } from '../staff/entities/staff.entity';
import { BrandModule } from '../brand/brand.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestDrive, Vehicle, Staff]),
    BrandModule,
  ],
  controllers: [
    BrandTestDriveController, // NEW: Path-based routing /:brandCode/test-drives
    AdminTestDriveController, // NEW: Admin cross-brand access /admin/test-drives
    TestDriveController, // OLD: Deprecated (kept for backward compatibility)
  ],
  providers: [TestDriveService],
  exports: [TestDriveService],
})
export class TestDriveModule {}
