// src/modules/test-drive/test-drive.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestDriveController } from './controllers/test-drive.controller';
import { TestDriveService } from './services/test-drive.service';
import { TestDrive } from './entities/test-drive.entity';
import { Vehicle } from '../stock/entities/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestDrive, Vehicle])
  ],
  controllers: [TestDriveController],
  providers: [TestDriveService],
  exports: [TestDriveService],
})
export class TestDriveModule {}
