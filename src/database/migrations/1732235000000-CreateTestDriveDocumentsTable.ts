import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/**
 * Migration: CreateTestDriveDocumentsTable
 *
 * Purpose: สร้างตาราง test_drive_documents สำหรับเก็บข้อมูลเอกสารการทดลองขับ
 *
 * Features:
 * - เก็บข้อมูลพนักงานขาย (ชื่อ, เบอร์โทร)
 * - เก็บข้อมูลลูกค้าแบบละเอียด (บัตรประชาชน, ที่อยู่)
 * - เก็บข้อมูลรถแบบละเอียด (VIN, เลขไมล์, สี, รุ่น)
 * - เก็บ URL ของรูปภาพ (ใบขับขี่, ลายเซ็น)
 * - เก็บ URL ของไฟล์ PDF เอกสารฉบับสมบูรณ์
 * - Foreign Keys ไปที่ test_drives และ brands
 * - Unique constraint บน test_drive_id (1 test drive = 1 document)
 */
export class CreateTestDriveDocumentsTable1732235000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Creating test_drive_documents table...');

    await queryRunner.createTable(
      new Table({
        name: 'test_drive_documents',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'test_drive_id',
            type: 'int',
            isUnique: true,
            isNullable: false,
            comment: 'Reference to test_drives table',
          },
          {
            name: 'brand_id',
            type: 'int',
            isNullable: false,
            comment: 'Reference to brands table',
          },
          // ข้อมูลพนักงานขาย
          {
            name: 'sales_specialist',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'ชื่อพนักงานขาย',
          },
          {
            name: 'sales_tel',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: 'เบอร์โทรพนักงานขาย',
          },
          // ข้อมูลลูกค้า
          {
            name: 'customer_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'ชื่อ-นามสกุลลูกค้า',
          },
          {
            name: 'customer_id_number',
            type: 'varchar',
            length: '13',
            isNullable: true,
            comment: 'เลขบัตรประชาชน',
          },
          {
            name: 'customer_tel',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: 'เบอร์โทรลูกค้า',
          },
          {
            name: 'customer_house_no',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'บ้านเลขที่',
          },
          {
            name: 'customer_village',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'หมู่',
          },
          {
            name: 'customer_district',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'แขวง/ตำบล',
          },
          {
            name: 'customer_province',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'จังหวัด',
          },
          // ข้อมูลรถ
          {
            name: 'purpose',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'วัตถุประสงค์การใช้รถ (testDrive, demo, etc.)',
          },
          {
            name: 'vehicle_brand',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'ยี่ห้อรถ',
          },
          {
            name: 'vehicle_model',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'รุ่นรถ',
          },
          {
            name: 'vehicle_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'ประเภทรถ (4x4, 4x2, etc.)',
          },
          {
            name: 'vehicle_color',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'สีรถ',
          },
          {
            name: 'vin_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'หมายเลขตัวถัง (VIN)',
          },
          {
            name: 'start_mileage',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'เลขไมล์เริ่มต้น',
          },
          {
            name: 'end_mileage',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'เลขไมล์สิ้นสุด',
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
            comment: 'วันที่เริ่มทดลองขับ',
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
            comment: 'วันที่สิ้นสุดทดลองขับ',
          },
          // ไฟล์และรูปภาพ
          {
            name: 'license_image_url',
            type: 'text',
            isNullable: true,
            comment: 'URL รูปถ่ายใบขับขี่',
          },
          {
            name: 'customer_signature_url',
            type: 'text',
            isNullable: true,
            comment: 'URL ลายเซ็นลูกค้า',
          },
          {
            name: 'sales_signature_url',
            type: 'text',
            isNullable: true,
            comment: 'URL ลายเซ็นพนักงานขาย',
          },
          {
            name: 'manager_signature_url',
            type: 'text',
            isNullable: true,
            comment: 'URL ลายเซ็นผู้จัดการ',
          },
          {
            name: 'pdf_url',
            type: 'text',
            isNullable: true,
            comment: 'URL ของไฟล์ PDF เอกสารฉบับสมบูรณ์',
          },
          // Timestamps
          {
            name: 'created_at',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
      }),
      true,
    );

    console.log('✅ test_drive_documents table created');
    console.log('🔧 Creating foreign key constraints...');

    // Foreign Key to test_drives
    await queryRunner.createForeignKey(
      'test_drive_documents',
      new TableForeignKey({
        name: 'FK_TEST_DRIVE_DOCUMENT_TEST_DRIVE',
        columnNames: ['test_drive_id'],
        referencedTableName: 'test_drives',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Foreign Key to brands
    await queryRunner.createForeignKey(
      'test_drive_documents',
      new TableForeignKey({
        name: 'FK_TEST_DRIVE_DOCUMENT_BRAND',
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    console.log('✅ Foreign keys created');
    console.log('🔧 Creating indexes...');

    // Indexes for performance
    await queryRunner.createIndex(
      'test_drive_documents',
      new TableIndex({
        name: 'IDX_TEST_DRIVE_DOCUMENT_TEST_DRIVE',
        columnNames: ['test_drive_id'],
      }),
    );

    await queryRunner.createIndex(
      'test_drive_documents',
      new TableIndex({
        name: 'IDX_TEST_DRIVE_DOCUMENT_BRAND',
        columnNames: ['brand_id'],
      }),
    );

    console.log('✅ Indexes created');
    console.log('✅ Migration CreateTestDriveDocumentsTable completed!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back CreateTestDriveDocumentsTable migration...');

    // Drop indexes
    await queryRunner.dropIndex(
      'test_drive_documents',
      'IDX_TEST_DRIVE_DOCUMENT_BRAND',
    );
    await queryRunner.dropIndex(
      'test_drive_documents',
      'IDX_TEST_DRIVE_DOCUMENT_TEST_DRIVE',
    );

    // Drop foreign keys
    await queryRunner.dropForeignKey(
      'test_drive_documents',
      'FK_TEST_DRIVE_DOCUMENT_BRAND',
    );
    await queryRunner.dropForeignKey(
      'test_drive_documents',
      'FK_TEST_DRIVE_DOCUMENT_TEST_DRIVE',
    );

    // Drop table
    await queryRunner.dropTable('test_drive_documents');

    console.log('✅ Rollback completed');
  }
}
