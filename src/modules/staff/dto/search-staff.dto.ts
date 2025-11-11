import { IsOptional, IsNumber, IsEnum, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StaffRole, StaffStatus } from '../entities/staff.entity';

export class SearchStaffDto {
  @ApiPropertyOptional({
    description: 'หน้าที่ต้องการ (เริ่มจาก 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'จำนวนรายการต่อหน้า',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'กรองตามบทบาท',
    enum: StaffRole,
    example: StaffRole.SALES,
  })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiPropertyOptional({
    description: 'กรองตามสถานะ',
    enum: StaffStatus,
    example: StaffStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @ApiPropertyOptional({
    description: 'ค้นหาจาก ชื่อ, อีเมล, หรือรหัสพนักงาน',
    example: 'สมชาย',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
