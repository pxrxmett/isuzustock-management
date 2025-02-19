// src/modules/test-drive/dto/update-test-drive.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDate, IsEnum, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TestDriveStatus } from '../entities/test-drive.entity';

export class UpdateTestDriveDto {
  @ApiPropertyOptional({ description: 'เวลาเริ่มทดลองขับ' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_time?: Date;

  @ApiPropertyOptional({ description: 'เวลาสิ้นสุดที่คาดว่าจะใช้' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expected_end_time?: Date;

  @ApiPropertyOptional({ description: 'เวลาสิ้นสุดจริง' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  actual_end_time?: Date;

  @ApiPropertyOptional({ description: 'เส้นทางที่ใช้ทดสอบ' })
  @IsOptional()
  @IsString()
  test_route?: string;

  @ApiPropertyOptional({ description: 'ระยะทางที่ใช้ (กม.)' })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiPropertyOptional({ description: 'ระยะเวลาที่ใช้ (นาที)' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'พนักงานผู้รับผิดชอบ' })
  @IsOptional()
  @IsString()
  responsible_staff?: string;

  @ApiPropertyOptional({
    description: 'สถานะการทดลองขับ',
    enum: TestDriveStatus,
    example: TestDriveStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(TestDriveStatus)
  status?: TestDriveStatus;
}
