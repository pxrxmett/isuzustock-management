import { IsString, IsEnum, IsDateString, IsOptional, IsArray, MaxLength, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '../entities/event-status.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'งานแสดงรถยนต์ไฟฟ้า 2025', description: 'ชื่องาน' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'งานแสดงรถยนต์ไฟฟ้าครั้งใหญ่', description: 'รายละเอียดงาน' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EventType, example: EventType.CAR_SHOW, description: 'ประเภทงาน' })
  @IsEnum(EventType)
  type: EventType;

  @ApiPropertyOptional({ enum: EventStatus, example: EventStatus.PLANNING, description: 'สถานะงาน' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ example: 'ศูนย์การค้าเซ็นทรัลเวิลด์', description: 'สถานที่จัดงาน' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @ApiProperty({ example: '2025-02-01', description: 'วันที่เริ่มงาน (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-02-05', description: 'วันที่สิ้นสุดงาน (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: '09:00:00', description: 'เวลาเริ่มงาน (HH:MM:SS)' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '18:00:00', description: 'เวลาสิ้นสุดงาน (HH:MM:SS)' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: 1, description: 'ผู้สร้างงาน (Staff ID)' })
  @IsOptional()
  @IsNumber()
  createdBy?: number;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2],
    description: 'รายชื่อพนักงานที่ได้รับมอบหมาย (Staff IDs)'
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  assignedStaffIds?: number[];

  @ApiPropertyOptional({ example: 'หมายเหตุเพิ่มเติม', description: 'หมายเหตุ' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'รหัสแบรนด์ (1=ISUZU, 2=BYD)',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  brandId?: number;
}
