import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirstNameLastNameToStaff1762900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Adding first_name and last_name columns to staff table...');

    // เพิ่ม columns ใหม่
    await queryRunner.query(`
      ALTER TABLE staff
      ADD COLUMN first_name VARCHAR(50) NULL AFTER employee_code,
      ADD COLUMN last_name VARCHAR(50) NULL AFTER first_name
    `);

    console.log('✅ Columns added successfully');

    // อัพเดทข้อมูลเก่าโดยแยก full_name เป็น first_name และ last_name
    console.log('🔄 Migrating existing full_name data...');

    await queryRunner.query(`
      UPDATE staff
      SET first_name = SUBSTRING_INDEX(full_name, ' ', 1),
          last_name = TRIM(SUBSTRING(full_name, LOCATE(' ', full_name) + 1))
      WHERE full_name IS NOT NULL
        AND full_name != ''
        AND LOCATE(' ', full_name) > 0
    `);

    console.log('✅ Data migration completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Removing first_name and last_name columns...');

    await queryRunner.query(`
      ALTER TABLE staff
      DROP COLUMN first_name,
      DROP COLUMN last_name
    `);

    console.log('✅ Columns removed');
  }
}
