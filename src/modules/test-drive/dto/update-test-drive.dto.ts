import { IsOptional, IsString, IsDate, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TestDriveStatus } from '../entities/test-drive-status.enum'; // แก้ไขการนำเข้า TestDriveStatus

export class UpdateTestDriveDto {
  @ApiPropertyOptional({
    example: 'ทดสอบ ระบบ',
    description: 'ชื่อลูกค้า'
  })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiPropertyOptional({
    example: '0812345678',
    description: 'เบอร์โทรลูกค้า'
  })
  @IsOptional()
  @IsString()
  customer_phone?: string;

  @ApiPropertyOptional({
    example: '12-34567890-12',
    description: 'เลขที่ใบขับขี่ลูกค้า'
  })
  @IsOptional()
  @IsString()
  customer_license_number?: string;

  @ApiPropertyOptional({
    example: 'ลูกค้าต้องการทดสอบตอนเช้า',
    description: 'หมายเหตุเพิ่มเติม'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: '2023-01-15T10:00:00Z',
    description: 'เวลาเริ่มทดลองขับ'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_time?: Date;

  @ApiPropertyOptional({
    example: '2023-01-15T11:00:00Z',
    description: 'เวลาสิ้นสุดที่คาดหวัง'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expected_end_time?: Date;

  @ApiPropertyOptional({
    example: '2023-01-15T10:45:00Z',
    description: 'เวลาสิ้นสุดจริง'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  actual_end_time?: Date;

  @ApiPropertyOptional({
    example: 'เส้นทางรอบโรงงาน',
    description: 'เส้นทางทดสอบ'
  })
  @IsOptional()
  @IsString()
  test_route?: string;

  @ApiPropertyOptional({
    example: 10.5,
    description: 'ระยะทาง (กม.)'
  })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiPropertyOptional({
    example: 60,
    description: 'ระยะเวลา (นาที)'
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'รหัสพนักงานผู้รับผิดชอบ'
  })
  @IsOptional()
  @IsNumber()
  responsible_staff?: number;

  @ApiPropertyOptional({
    enum: TestDriveStatus,
    description: 'สถานะการทดลองขับ'
  })
  @IsOptional()
  @IsEnum(TestDriveStatus)
  status?: TestDriveStatus;
}
