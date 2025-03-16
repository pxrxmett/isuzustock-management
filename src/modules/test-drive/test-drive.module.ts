import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestDriveController } from './controllers/test-drive.controller';
import { TestDriveService } from './services/test-drive.service';
import { TestDrive } from './entities/test-drive.entity';
import { Vehicle } from '../stock/entities/vehicle.entity';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestDrive, Vehicle, Staff])
  ],
  controllers: [TestDriveController],
  providers: [TestDriveService],
  exports: [TestDriveService],
})
export class TestDriveModule {}
