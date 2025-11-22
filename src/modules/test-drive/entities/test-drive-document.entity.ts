import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { TestDrive } from './test-drive.entity';
import { Brand } from '../../brand/entities/brand.entity';

/**
 * TestDriveDocument Entity
 *
 * เก็บข้อมูลเอกสารการทดลองขับแบบละเอียด พร้อม PDF และรูปภาพ
 * สำหรับใช้ในการสร้างเอกสารทางกฎหมายและบันทึกการทดลองขับ
 */
@Entity('test_drive_documents')
@Index('IDX_TEST_DRIVE_DOCUMENT_TEST_DRIVE', ['testDriveId'])
@Index('IDX_TEST_DRIVE_DOCUMENT_BRAND', ['brandId'])
export class TestDriveDocument {
  @PrimaryGeneratedColumn()
  id: number;

  // Relations
  @Column({ name: 'test_drive_id', unique: true })
  testDriveId: number;

  @OneToOne(() => TestDrive)
  @JoinColumn({ name: 'test_drive_id' })
  testDrive: TestDrive;

  @Column({ name: 'brand_id' })
  brandId: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  // ข้อมูลพนักงานขาย (Sales Specialist)
  @Column({
    name: 'sales_specialist',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  salesSpecialist: string | null;

  @Column({
    name: 'sales_tel',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  salesTel: string | null;

  // ข้อมูลลูกค้า (Customer Information)
  @Column({
    name: 'customer_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  customerName: string | null;

  @Column({
    name: 'customer_id_number',
    type: 'varchar',
    length: 13,
    nullable: true,
    comment: 'เลขบัตรประชาชน',
  })
  customerIdNumber: string | null;

  @Column({
    name: 'customer_tel',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  customerTel: string | null;

  @Column({
    name: 'customer_house_no',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  customerHouseNo: string | null;

  @Column({
    name: 'customer_village',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  customerVillage: string | null;

  @Column({
    name: 'customer_district',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  customerDistrict: string | null;

  @Column({
    name: 'customer_province',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  customerProvince: string | null;

  // ข้อมูลรถ (Vehicle Information)
  @Column({
    name: 'purpose',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'วัตถุประสงค์การใช้รถ (testDrive, demo, etc.)',
  })
  purpose: string | null;

  @Column({
    name: 'vehicle_brand',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  vehicleBrand: string | null;

  @Column({
    name: 'vehicle_model',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  vehicleModel: string | null;

  @Column({
    name: 'vehicle_type',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '4x4, 4x2, etc.',
  })
  vehicleType: string | null;

  @Column({
    name: 'vehicle_color',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  vehicleColor: string | null;

  @Column({
    name: 'vin_number',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'หมายเลขตัวถัง (VIN)',
  })
  vinNumber: string | null;

  @Column({
    name: 'start_mileage',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'เลขไมล์เริ่มต้น',
  })
  startMileage: string | null;

  @Column({
    name: 'end_mileage',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'เลขไมล์สิ้นสุด',
  })
  endMileage: string | null;

  @Column({
    name: 'start_date',
    type: 'date',
    nullable: true,
  })
  startDate: Date | null;

  @Column({
    name: 'end_date',
    type: 'date',
    nullable: true,
  })
  endDate: Date | null;

  // ไฟล์และรูปภาพ (Files and Images)
  @Column({
    name: 'license_image_url',
    type: 'text',
    nullable: true,
    comment: 'URL รูปถ่ายใบขับขี่',
  })
  licenseImageUrl: string | null;

  @Column({
    name: 'customer_signature_url',
    type: 'text',
    nullable: true,
    comment: 'URL ลายเซ็นลูกค้า',
  })
  customerSignatureUrl: string | null;

  @Column({
    name: 'sales_signature_url',
    type: 'text',
    nullable: true,
    comment: 'URL ลายเซ็นพนักงานขาย',
  })
  salesSignatureUrl: string | null;

  @Column({
    name: 'manager_signature_url',
    type: 'text',
    nullable: true,
    comment: 'URL ลายเซ็นผู้จัดการ',
  })
  managerSignatureUrl: string | null;

  @Column({
    name: 'pdf_url',
    type: 'text',
    nullable: true,
    comment: 'URL ของไฟล์ PDF เอกสารฉบับสมบูรณ์',
  })
  pdfUrl: string | null;

  // Timestamps
  @CreateDateColumn({
    type: 'datetime',
    precision: 6,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 6,
    name: 'updated_at',
  })
  updatedAt: Date;
}
