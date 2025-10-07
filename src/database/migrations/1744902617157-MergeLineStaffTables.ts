import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class MergeLineStaffTables1744902617157 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ตรวจสอบว่าคอลัมน์มีอยู่แล้วหรือไม่
    const table = await queryRunner.getTable('staffs');
    const hasLineUserIdColumn = table?.findColumnByName('line_user_id');
    const hasLineDisplayNameColumn = table?.findColumnByName('line_display_name');
    const hasLinePictureUrlColumn = table?.findColumnByName('line_picture_url');
    const hasLineLastLoginAtColumn = table?.findColumnByName('line_last_login_at');

    // 1. สร้างคอลัมน์ใหม่ใน staff table (ถ้ายังไม่มี)
    const columnsToAdd: TableColumn[] = [];
    
    if (!hasLineUserIdColumn) {
      columnsToAdd.push(
        new TableColumn({
          name: 'line_user_id',
          type: 'varchar',
          length: '50',
          isNullable: true,
        })
      );
    }
    
    if (!hasLineDisplayNameColumn) {
      columnsToAdd.push(
        new TableColumn({
          name: 'line_display_name',
          type: 'varchar',
          length: '100',
          isNullable: true,
        })
      );
    }
    
    if (!hasLinePictureUrlColumn) {
      columnsToAdd.push(
        new TableColumn({
          name: 'line_picture_url',
          type: 'varchar',
          length: '255',
          isNullable: true,
        })
      );
    }
    
    if (!hasLineLastLoginAtColumn) {
      columnsToAdd.push(
        new TableColumn({
          name: 'line_last_login_at',
          type: 'timestamp',
          isNullable: true,
        })
      );
    }
    
    if (columnsToAdd.length > 0) {
      await queryRunner.addColumns('staffs', columnsToAdd);
      console.log('เพิ่มคอลัมน์ใหม่ใน staffs สำเร็จ');
    }

    // 2. สร้าง index สำหรับ line_user_id (ถ้ายังไม่มี)
    const hasLineUserIdIndex = table?.indices.find(index => 
      index.name === 'IDX_STAFF_LINE_USER_ID'
    );

    if (!hasLineUserIdIndex) {
      await queryRunner.createIndex('staffs', new TableIndex({
        name: 'IDX_STAFF_LINE_USER_ID',
        columnNames: ['line_user_id'],
        isUnique: true,
      }));
      console.log('สร้าง index สำหรับ line_user_id สำเร็จ');
    }

    // 3. ตรวจสอบว่าตาราง line_profiles มีอยู่หรือไม่
    try {
      const lineProfilesTable = await queryRunner.query(`
        SELECT TABLE_NAME 
        FROM information_schema.tables 
        WHERE table_schema = 'stock_management' 
        AND table_name = 'line_profiles'
      `);
      
      if (lineProfilesTable && lineProfilesTable.length > 0) {
        console.log('เริ่มโอนข้อมูลจากตาราง line_profiles ไปยัง staffs');
        
        // สำรองข้อมูลตาราง line_profiles ก่อนลบ
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS line_profiles_backup AS
          SELECT * FROM line_profiles;
        `);
        console.log('สร้างตาราง line_profiles_backup สำเร็จ');

        // โอนข้อมูลจาก line_profiles ไปยัง staffs
        try {
          await queryRunner.query(`
            UPDATE staffs s
            INNER JOIN line_profiles lp ON s.id = lp.staff_id
            SET 
              s.line_user_id = lp.line_user_id,
              s.line_display_name = lp.display_name,
              s.line_picture_url = lp.picture_url,
              s.line_last_login_at = lp.last_login_at
          `);
          console.log('โอนข้อมูลจาก line_profiles ไปยัง staffs สำเร็จ');
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการโอนข้อมูล:', error);
        }

        // ลบตาราง line_profiles
        try {
          await queryRunner.query(`DROP TABLE IF EXISTS line_profiles`);
          console.log('ลบตาราง line_profiles สำเร็จ');
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการลบตาราง line_profiles:', error);
        }
      } else {
        console.log('ไม่พบตาราง line_profiles');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการตรวจสอบตาราง:', error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. ตรวจสอบว่ามีตาราง line_profiles_backup หรือไม่
    try {
      const backupTable = await queryRunner.query(`
        SELECT TABLE_NAME 
        FROM information_schema.tables 
        WHERE table_schema = 'stock_management' 
        AND table_name = 'line_profiles_backup'
      `);
      
      if (backupTable && backupTable.length > 0) {
        console.log('เริ่มกู้คืนข้อมูลจาก line_profiles_backup');
        
        // 1. สร้างตาราง line_profiles ขึ้นมาใหม่
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS line_profiles (
            id varchar(36) PRIMARY KEY,
            line_user_id varchar(50) UNIQUE NOT NULL,
            display_name varchar(100) NOT NULL,
            picture_url varchar(255),
            last_login_at timestamp,
            staff_id varchar(36),
            created_at timestamp DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE
          );
        `);
        console.log('สร้างตาราง line_profiles สำเร็จ');

        // 2. โอนข้อมูลจาก line_profiles_backup ไปยัง line_profiles
        await queryRunner.query(`
          INSERT INTO line_profiles 
          SELECT * FROM line_profiles_backup;
        `);
        console.log('โอนข้อมูลจาก line_profiles_backup ไปยัง line_profiles สำเร็จ');
      } else {
        console.log('ไม่พบตาราง backup จะสร้างตารางใหม่และโอนข้อมูลจาก staffs');
        
        // สร้างตารางใหม่และโอนข้อมูลจาก staffs
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS line_profiles (
            id varchar(36) PRIMARY KEY DEFAULT (UUID()),
            line_user_id varchar(50) UNIQUE NOT NULL,
            display_name varchar(100) NOT NULL,
            picture_url varchar(255),
            last_login_at timestamp,
            staff_id varchar(36),
            created_at timestamp DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE
          );
        `);
        console.log('สร้างตาราง line_profiles สำเร็จ');

        // โอนข้อมูลจาก staffs ไปยัง line_profiles
        await queryRunner.query(`
          INSERT INTO line_profiles (id, line_user_id, display_name, picture_url, last_login_at, staff_id, created_at, updated_at)
          SELECT UUID(), line_user_id, line_display_name, line_picture_url, line_last_login_at, id, NOW(), NOW()
          FROM staffs
          WHERE line_user_id IS NOT NULL
        `);
        console.log('โอนข้อมูลจาก staffs ไปยัง line_profiles สำเร็จ');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการสร้างตาราง line_profiles:', error);
    }

    // 3. ลบคอลัมน์ใน staffs
    try {
      const table = await queryRunner.getTable('staffs');
      
      if (table?.findColumnByName('line_user_id')) {
        await queryRunner.query(`ALTER TABLE staffs DROP COLUMN line_user_id`);
      }
      
      if (table?.findColumnByName('line_display_name')) {
        await queryRunner.query(`ALTER TABLE staffs DROP COLUMN line_display_name`);
      }
      
      if (table?.findColumnByName('line_picture_url')) {
        await queryRunner.query(`ALTER TABLE staffs DROP COLUMN line_picture_url`);
      }
      
      if (table?.findColumnByName('line_last_login_at')) {
        await queryRunner.query(`ALTER TABLE staffs DROP COLUMN line_last_login_at`);
      }
      
      console.log('ลบคอลัมน์ที่เกี่ยวข้องกับ LINE ออกจากตาราง staffs สำเร็จ');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบคอลัมน์:', error);
    }
  }
}
