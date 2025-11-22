import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: EnsureBrandsData
 *
 * Purpose: เพิ่มข้อมูล brands เริ่มต้น (ISUZU และ BYD)
 * สำหรับ Railway database ที่อาจยังไม่มีข้อมูล
 *
 * Features:
 * - ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่ (idempotent)
 * - Insert ISUZU (id=1, fuel type)
 * - Insert BYD (id=2, electric type)
 * - ใช้ INSERT ... ON DUPLICATE KEY UPDATE เพื่อป้องกัน duplicate
 */
export class EnsureBrandsData1732234900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔍 Checking brands data...');

    // ตรวจสอบว่ามีข้อมูล brands อยู่แล้วหรือไม่
    const brandsCount = await queryRunner.query(
      `SELECT COUNT(*) as count FROM brands`,
    );

    const count = brandsCount[0]?.count || 0;

    if (count > 0) {
      console.log(`✅ Brands data already exists (${count} records). Skipping insertion.`);
      return;
    }

    console.log('🔧 Inserting initial brands data...');

    // Insert ISUZU and BYD brands
    // ใช้ INSERT ... ON DUPLICATE KEY UPDATE เพื่อป้องกันการ insert ซ้ำ
    await queryRunner.query(`
      INSERT INTO brands (id, name, code, description, logo_url, vehicle_type, is_active, created_at, updated_at)
      VALUES
        (1, 'ISUZU', 'ISUZU', 'ISUZU - ผู้ผลิตรถกระบะและรถบรรทุกชั้นนำ', NULL, 'fuel', 1, NOW(), NOW()),
        (2, 'BYD', 'BYD', 'BYD - ผู้ผลิตรถยนต์ไฟฟ้าชั้นนำระดับโลก', NULL, 'electric', 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        code = VALUES(code),
        description = VALUES(description),
        vehicle_type = VALUES(vehicle_type),
        is_active = VALUES(is_active),
        updated_at = NOW()
    `);

    console.log('✅ Brands data inserted successfully');
    console.log('   - ID 1: ISUZU (fuel)');
    console.log('   - ID 2: BYD (electric)');
    console.log('✅ Migration EnsureBrandsData completed!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back EnsureBrandsData migration...');
    console.log('⚠️  WARNING: This will delete ISUZU and BYD brands data!');

    // ลบข้อมูล brands ที่เพิ่มไว้
    // ระวัง: ถ้ามี foreign key constraints อาจต้องจัดการก่อน
    await queryRunner.query(`
      DELETE FROM brands WHERE id IN (1, 2)
    `);

    console.log('✅ Brands data removed');
    console.log('✅ Rollback completed');
  }
}
