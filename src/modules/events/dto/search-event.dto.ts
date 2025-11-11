import { IsOptional, IsEnum, IsDateString, IsString, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '../entities/event-status.enum';
import { Transform } from 'class-transformer';

export class SearchEventDto {
  @ApiPropertyOptional({ example: 'ISUZU', description: 'กรองตามแบรนด์ (รหัสหรือชื่อ)' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 1, description: 'กรองตามรหัสแบรนด์' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({ enum: EventStatus, description: 'กรองตามสถานะงาน' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ enum: EventType, description: 'กรองตามประเภทงาน' })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'ค้นหาตั้งแต่วันที่ (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'ค้นหาถึงวันที่ (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'งานแสดงรถ', description: 'ค้นหาจากชื่องาน' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'true', description: 'แสดงเฉพาะงานที่ active' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '1', description: 'หน้าที่ต้องการ' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @ApiPropertyOptional({ example: '10', description: 'จำนวนรายการต่อหน้า' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;
}
