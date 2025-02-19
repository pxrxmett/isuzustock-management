// src/modules/test-drive/dto/export-report.dto.ts
import { IsOptional, IsString, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TestDriveStatus } from '../entities/test-drive.entity';

export class ExportReportDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;

  @IsOptional()
  @IsString()
  car_model?: string;

  @IsOptional()
  @IsString()
  responsible_staff?: string;

  @IsOptional()
  @IsEnum(TestDriveStatus)
  status?: TestDriveStatus;

  @IsOptional()
  @IsString()
  export_type?: 'xlsx' | 'csv' = 'xlsx';
}
