import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestDriveStatus } from '../entities/test-drive.entity';

export class CreateTestDriveDto {
  @ApiProperty({ example: 1, description: 'รหัสรถ' })
  @IsNumber()
  vehicle_id: number;

  @ApiProperty({ example: 'ทดสอบ ระบบ', description: 'ชื่อลูกค้า' })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiProperty({ example: '0812345678', description: 'เบอร์โทรลูกค้า' })
  @IsString()
  @IsNotEmpty()
  customer_phone: string;

  @ApiProperty({ example: '2025-02-08T10:00:00.000Z', description: 'เวลาเริ่มทดลองขับ' })
  @IsDateString()
  start_time: Date;

  @ApiProperty({ example: '2025-02-08T11:00:00.000Z', description: 'เวลาสิ้นสุดที่คาดหวัง' })
  @IsDateString()
  expected_end_time: Date;

  @ApiPropertyOptional({ description: 'เวลาสิ้นสุดจริง' })
  @IsOptional()
  @IsDateString()
  actual_end_time?: Date;

  @ApiPropertyOptional({ example: 'เส้นทางรอบโรงงาน', description: 'เส้นทางทดสอบ' })
  @IsOptional()
  @IsString()
  test_route?: string;

  @ApiPropertyOptional({ example: 10.5, description: 'ระยะทาง (กม.)' })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiProperty({ example: 60, description: 'ระยะเวลา (นาที)' })
  @IsNumber()
  duration: number;

  @ApiProperty({ example: 'พนักงาน001', description: 'พนักงานผู้รับผิดชอบ' })
  @IsString()
  @IsNotEmpty()
  responsible_staff: string;

  @ApiPropertyOptional({ enum: TestDriveStatus, default: TestDriveStatus.PENDING })
  @IsOptional()
  @IsEnum(TestDriveStatus)
  status?: TestDriveStatus;
}
