import { IsOptional, IsString, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TestDriveStatus } from '../entities/test-drive-status.enum'; // แก้ไขการนำเข้า TestDriveStatus

export class ExportReportDto {
  @ApiPropertyOptional({
    description: 'ชื่อลูกค้า',
    type: String
  })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiPropertyOptional({
    description: 'เบอร์โทรลูกค้า',
    type: String
  })
  @IsOptional()
  @IsString()
  customer_phone?: string;

  @ApiPropertyOptional({
    description: 'รหัสรถ',
    type: String
  })
  @IsOptional()
  @IsString()
  vehicleCode?: string;

  @ApiPropertyOptional({
    description: 'สถานะการทดลองขับ',
    enum: TestDriveStatus
  })
  @IsOptional()
  @IsEnum(TestDriveStatus)
  status?: TestDriveStatus;

  @ApiPropertyOptional({
    description: 'วันที่เริ่มต้น',
    type: Date
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'วันที่สิ้นสุด',
    type: Date
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;

  @ApiPropertyOptional({
    description: 'รูปแบบการส่งออก',
    default: 'xlsx',
    enum: ['xlsx', 'csv', 'pdf']
  })
  @IsOptional()
  @IsString()
  format?: string;
}
