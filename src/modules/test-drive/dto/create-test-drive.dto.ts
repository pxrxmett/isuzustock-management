import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestDriveStatus } from '../entities/test-drive.entity';

export class CreateTestDriveDto {
  @ApiProperty({ 
    example: 1, 
    description: 'รหัสรถ',
    type: Number 
  })
  @IsNumber()
  @IsNotEmpty()
  vehicle_id: number;

  @ApiProperty({ 
    example: 'ทดสอบ ระบบ', 
    description: 'ชื่อลูกค้า',
    type: String 
  })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiProperty({ 
    example: '0812345678', 
    description: 'เบอร์โทรลูกค้า',
    type: String 
  })
  @IsString()
  @IsNotEmpty()
  customer_phone: string;

  @ApiProperty({ 
    example: '2025-02-08T10:00:00.000Z', 
    description: 'เวลาเริ่มทดลองขับ',
    type: String,
    format: 'date-time'
  })
  @IsDateString()
  start_time: Date;

  @ApiProperty({ 
    example: '2025-02-08T11:00:00.000Z', 
    description: 'เวลาสิ้นสุดที่คาดหวัง',
    type: String,
    format: 'date-time'
  })
  @IsDateString()
  expected_end_time: Date;

  @ApiPropertyOptional({ 
    description: 'เวลาสิ้นสุดจริง',
    type: String,
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  actual_end_time?: Date;

  @ApiPropertyOptional({ 
    example: 'เส้นทางรอบโรงงาน', 
    description: 'เส้นทางทดสอบ',
    type: String
  })
  @IsOptional()
  @IsString()
  test_route?: string;

  @ApiPropertyOptional({ 
    example: 10.5, 
    description: 'ระยะทาง (กม.)',
    type: Number
  })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiProperty({ 
    example: 60, 
    description: 'ระยะเวลา (นาที)',
    type: Number 
  })
  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @ApiProperty({ 
    example: 1, 
    description: 'รหัสพนักงานผู้รับผิดชอบ',
    type: Number
  })
  @IsNumber()
  @IsNotEmpty()
  responsible_staff: number;

  @ApiPropertyOptional({ 
    enum: TestDriveStatus, 
    default: TestDriveStatus.PENDING,
    description: 'สถานะการทดลองขับ'
  })
  @IsOptional()
  @IsEnum(TestDriveStatus)
  status?: TestDriveStatus;
}
