import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsObject,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO สำหรับ Signatures (ลายเซ็นดิจิทัล 3 ฝ่าย)
 */
class SignaturesDto {
  @ApiProperty({
    description: 'ลายเซ็นลูกค้า (base64 image)',
    example: 'data:image/png;base64,iVBORw0KG...',
    required: false,
  })
  @IsOptional()
  @IsString()
  customer?: string;

  @ApiProperty({
    description: 'ลายเซ็นพนักงานขาย (base64 image)',
    example: 'data:image/png;base64,iVBORw0KG...',
    required: false,
  })
  @IsOptional()
  @IsString()
  sales?: string;

  @ApiProperty({
    description: 'ลายเซ็นผู้จัดการ (base64 image)',
    example: 'data:image/png;base64,iVBORw0KG...',
    required: false,
  })
  @IsOptional()
  @IsString()
  manager?: string;
}

/**
 * DTO สำหรับสร้าง/อัปเดตเอกสารการทดลองขับ
 */
export class CreateTestDriveDocumentDto {
  // ข้อมูลพนักงานขาย
  @ApiProperty({
    description: 'ชื่อพนักงานขาย/ที่ปรึกษาการขาย',
    example: 'นาย สมชาย ใจดี',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  salesSpecialist?: string;

  @ApiProperty({
    description: 'เบอร์โทรพนักงานขาย',
    example: '0812345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-() ]+$/, {
    message: 'เบอร์โทรต้องเป็นตัวเลขเท่านั้น',
  })
  tel?: string;

  // ข้อมูลลูกค้า
  @ApiProperty({
    description: 'ชื่อ-นามสกุลลูกค้า',
    example: 'นาย ทดสอบ ระบบ',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerName?: string;

  @ApiProperty({
    description: 'เลขบัตรประชาชน (13 หลัก)',
    example: '1234567890123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  @Matches(/^\d{13}$/, {
    message: 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก',
  })
  idNumber?: string;

  @ApiProperty({
    description: 'เบอร์โทรลูกค้า',
    example: '0898765432',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerTel?: string;

  @ApiProperty({
    description: 'บ้านเลขที่',
    example: '123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  houseNo?: string;

  @ApiProperty({
    description: 'หมู่',
    example: '5',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  village?: string;

  @ApiProperty({
    description: 'แขวง/ตำบล',
    example: 'บางนา',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({
    description: 'จังหวัด',
    example: 'กรุงเทพมหานคร',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  // ข้อมูลรถ
  @ApiProperty({
    description: 'วัตถุประสงค์การใช้รถ',
    example: 'testDrive',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  purpose?: string;

  @ApiProperty({
    description: 'ยี่ห้อรถ',
    example: 'ISUZU',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  vehicleBrand?: string;

  @ApiProperty({
    description: 'รุ่นรถ',
    example: 'D-MAX',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiProperty({
    description: 'ประเภทรถ (4x4, 4x2, etc.)',
    example: '4x4',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @ApiProperty({
    description: 'สีรถ',
    example: 'ขาว',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiProperty({
    description: 'หมายเลขตัวถัง (VIN)',
    example: 'ABC123XYZ456',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vinNumber?: string;

  @ApiProperty({
    description: 'เลขไมล์เริ่มต้น',
    example: '1000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  startMileage?: string;

  @ApiProperty({
    description: 'เลขไมล์สิ้นสุด',
    example: '1050',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  endMileage?: string;

  @ApiProperty({
    description: 'วันที่เริ่มทดลองขับ (YYYY-MM-DD)',
    example: '2025-11-24',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'วันที่สิ้นสุดทดลองขับ (YYYY-MM-DD)',
    example: '2025-11-24',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // ไฟล์และรูปภาพ
  @ApiProperty({
    description: 'รูปถ่ายใบขับขี่ (base64 image)',
    example: 'data:image/png;base64,iVBORw0KG...',
    required: false,
  })
  @IsOptional()
  @IsString()
  licenseImage?: string;

  @ApiProperty({
    description: 'ลายเซ็นดิจิทัล 3 ฝ่าย (ลูกค้า, พนักงาน, ผู้จัดการ)',
    type: SignaturesDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SignaturesDto)
  signatures?: SignaturesDto;
}
