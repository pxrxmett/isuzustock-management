import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { BrandStaffController } from './controllers/brand-staff.controller';
import { AdminStaffController } from './controllers/admin-staff.controller';
import { Staff } from './entities/staff.entity';
import { BrandModule } from '../brand/brand.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff]),
    BrandModule, // Import BrandModule เพื่อใช้ BrandService
  ],
  controllers: [
    BrandStaffController, // Path-based: /:brandCode/staff
    AdminStaffController, // Admin: /admin/staff
  ],
  providers: [StaffService],
  exports: [StaffService], // Export เพื่อให้ modules อื่นใช้
})
export class StaffModule {}
