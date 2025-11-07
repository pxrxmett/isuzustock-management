import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUsernameFromStaffs1746900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // สร้าง typeorm_metadata table ถ้ายังไม่มี (fix migration tracking issue)
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS typeorm_metadata (
          type varchar(255) NOT NULL,
          database varchar(255) DEFAULT NULL,
          schema varchar(255) DEFAULT NULL,
          \`table\` varchar(255) DEFAULT NULL,
          name varchar(255) DEFAULT NULL,
          value text
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ สร้าง typeorm_metadata table สำเร็จ');
    } catch (error) {
      console.log('⚠️  typeorm_metadata table มีอยู่แล้ว หรือเกิดข้อผิดพลาด:', error.message);
    }

    try {
      // ตรวจสอบว่า staffs table มี username column หรือไม่ (ใช้ raw SQL)
      const columns = await queryRunner.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'staffs'
        AND COLUMN_NAME = 'username'
      `);

      if (columns && columns.length > 0) {
        console.log('🔍 พบคอลัมน์ username ในตาราง staffs กำลังลบ...');

        // ลบคอลัมน์ username ด้วย raw SQL
        await queryRunner.query(`ALTER TABLE staffs DROP COLUMN username`);

        console.log('✅ ลบคอลัมน์ username จากตาราง staffs สำเร็จ');
      } else {
        console.log('ℹ️  ไม่พบคอลัมน์ username ในตาราง staffs (ข้ามการลบ)');
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการลบคอลัมน์ username:', error.message);
      // ไม่ throw error เพื่อให้ app สามารถ start ได้
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // ตรวจสอบว่า username column ไม่มีอยู่
      const columns = await queryRunner.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'staffs'
        AND COLUMN_NAME = 'username'
      `);

      if (!columns || columns.length === 0) {
        console.log('กำลังเพิ่มคอลัมน์ username กลับเข้าไปในตาราง staffs...');

        // เพิ่มคอลัมน์ username กลับ (สำหรับ rollback)
        await queryRunner.query(`
          ALTER TABLE staffs
          ADD COLUMN username VARCHAR(50) NULL AFTER staff_code
        `);

        console.log('✅ เพิ่มคอลัมน์ username กลับเข้าไปในตาราง staffs สำเร็จ');
      } else {
        console.log('ℹ️  คอลัมน์ username มีอยู่แล้วในตาราง staffs (ข้ามการเพิ่ม)');
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการเพิ่มคอลัมน์ username:', error.message);
    }
  }
}
