import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

/**
 * DTO สำหรับ Response ของเอกสารการทดลองขับ
 */
export class TestDriveDocumentResponseDto {
  @ApiProperty({
    description: 'Document ID',
    example: 123,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Test Drive ID',
    example: 51,
  })
  @Expose()
  testDriveId: number;

  @ApiProperty({
    description: 'Brand ID',
    example: 1,
  })
  @Expose()
  brandId: number;

  // ข้อมูลพนักงานขาย
  @ApiProperty({
    description: 'ชื่อพนักงานขาย',
    example: 'นาย สมชาย ใจดี',
    required: false,
  })
  @Expose()
  salesSpecialist?: string;

  @ApiProperty({
    description: 'เบอร์โทรพนักงานขาย',
    example: '0812345678',
    required: false,
  })
  @Expose()
  salesTel?: string;

  // ข้อมูลลูกค้า
  @ApiProperty({
    description: 'ชื่อ-นามสกุลลูกค้า',
    example: 'นาย ทดสอบ ระบบ',
    required: false,
  })
  @Expose()
  customerName?: string;

  @ApiProperty({
    description: 'เลขบัตรประชาชน',
    example: '1234567890123',
    required: false,
  })
  @Expose()
  customerIdNumber?: string;

  @ApiProperty({
    description: 'เบอร์โทรลูกค้า',
    example: '0898765432',
    required: false,
  })
  @Expose()
  customerTel?: string;

  @ApiProperty({
    description: 'บ้านเลขที่',
    example: '123',
    required: false,
  })
  @Expose()
  customerHouseNo?: string;

  @ApiProperty({
    description: 'หมู่',
    example: '5',
    required: false,
  })
  @Expose()
  customerVillage?: string;

  @ApiProperty({
    description: 'แขวง/ตำบล',
    example: 'บางนา',
    required: false,
  })
  @Expose()
  customerDistrict?: string;

  @ApiProperty({
    description: 'จังหวัด',
    example: 'กรุงเทพมหานคร',
    required: false,
  })
  @Expose()
  customerProvince?: string;

  // ข้อมูลรถ
  @ApiProperty({
    description: 'วัตถุประสงค์การใช้รถ',
    example: 'testDrive',
    required: false,
  })
  @Expose()
  purpose?: string;

  @ApiProperty({
    description: 'ยี่ห้อรถ',
    example: 'ISUZU',
    required: false,
  })
  @Expose()
  vehicleBrand?: string;

  @ApiProperty({
    description: 'รุ่นรถ',
    example: 'D-MAX',
    required: false,
  })
  @Expose()
  vehicleModel?: string;

  @ApiProperty({
    description: 'ประเภทรถ',
    example: '4x4',
    required: false,
  })
  @Expose()
  vehicleType?: string;

  @ApiProperty({
    description: 'สีรถ',
    example: 'ขาว',
    required: false,
  })
  @Expose()
  vehicleColor?: string;

  @ApiProperty({
    description: 'หมายเลขตัวถัง (VIN)',
    example: 'ABC123XYZ456',
    required: false,
  })
  @Expose()
  vinNumber?: string;

  @ApiProperty({
    description: 'เลขไมล์เริ่มต้น',
    example: '1000',
    required: false,
  })
  @Expose()
  startMileage?: string;

  @ApiProperty({
    description: 'เลขไมล์สิ้นสุด',
    example: '1050',
    required: false,
  })
  @Expose()
  endMileage?: string;

  @ApiProperty({
    description: 'วันที่เริ่มทดลองขับ (format: yyyy-MM-dd)',
    example: '2025-11-24',
    required: false,
  })
  @Expose()
  @Transform(({ value }) => {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    return date.toISOString().split('T')[0]; // "yyyy-MM-dd"
  })
  startDate?: Date | string;

  @ApiProperty({
    description: 'วันที่สิ้นสุดทดลองขับ (format: yyyy-MM-dd)',
    example: '2025-11-24',
    required: false,
  })
  @Expose()
  @Transform(({ value }) => {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    return date.toISOString().split('T')[0]; // "yyyy-MM-dd"
  })
  endDate?: Date | string;

  // ไฟล์และรูปภาพ (URLs)
  @ApiProperty({
    description: 'URL รูปถ่ายใบขับขี่',
    example: 'https://storage.example.com/licenses/abc123.png',
    required: false,
  })
  @Expose()
  licenseImageUrl?: string;

  @ApiProperty({
    description: 'URL ลายเซ็นลูกค้า',
    example: 'https://storage.example.com/signatures/customer-abc123.png',
    required: false,
  })
  @Expose()
  customerSignatureUrl?: string;

  @ApiProperty({
    description: 'URL ลายเซ็นพนักงานขาย',
    example: 'https://storage.example.com/signatures/sales-abc123.png',
    required: false,
  })
  @Expose()
  salesSignatureUrl?: string;

  @ApiProperty({
    description: 'URL ลายเซ็นผู้จัดการ',
    example: 'https://storage.example.com/signatures/manager-abc123.png',
    required: false,
  })
  @Expose()
  managerSignatureUrl?: string;

  @ApiProperty({
    description: 'URL ของไฟล์ PDF เอกสารฉบับสมบูรณ์',
    example:
      'https://storage.example.com/documents/isuzu/test-drive-51-document.pdf',
    required: false,
  })
  @Expose()
  pdfUrl?: string;

  // Timestamps
  @ApiProperty({
    description: 'วันที่สร้างเอกสาร',
    example: '2025-11-22T10:30:00Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'วันที่อัปเดตเอกสาร',
    example: '2025-11-22T10:30:00Z',
  })
  @Expose()
  updatedAt: Date;
}
