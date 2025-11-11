import { PartialType } from '@nestjs/swagger';
import { CreateStaffDto } from './create-staff.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StaffStatus } from '../entities/staff.entity';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @ApiPropertyOptional({
    description: 'สถานะพนักงาน',
    enum: StaffStatus,
    example: StaffStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(StaffStatus, {
    message: 'Status must be active, inactive, or on_leave',
  })
  status?: StaffStatus;

  // Note: Cannot update brandId (immutable for security)
  // Cannot update employeeCode (use for reference)
}
