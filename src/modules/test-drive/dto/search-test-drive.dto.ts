// src/modules/test-drive/dto/search-test-drive.dto.ts
import { IsOptional, IsString, IsEnum, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TestDriveStatus } from '../entities/test-drive-status.enum'; // แก้ไขการนำเข้า TestDriveStatus

export class SearchTestDriveDto {
  @IsOptional()
  @IsString()
  brand?: string; // Brand code or ID

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brandId?: number;

  @IsOptional()
  @IsString()
  customer_name?: string; // ยังคงใช้ snake_case เพื่อความเข้ากันได้กับ API ภายนอก

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsString()
  vehicleCode?: string;

  @IsOptional()
  @IsString()
  responsible_staff?: string;

  @IsOptional()
  @IsEnum(TestDriveStatus)
  status?: TestDriveStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;
}
