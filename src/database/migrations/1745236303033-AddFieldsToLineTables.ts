import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsToLineTables1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ตรวจสอบว่ามีตาราง line_profiles หรือไม่
    const hasLineProfilesTable = await queryRunner.hasTable('line_profiles');
    if (hasLineProfilesTable) {
      // ตรวจสอบว่ามีคอลัมน์ status_message หรือไม่
      const hasStatusMessageColumn = await queryRunner.hasColumn('line_profiles', 'status_message');
      if (!hasStatusMessageColumn) {
        await queryRunner.query(`ALTER TABLE line_profiles ADD COLUMN status_message TEXT NULL`);
      }

      // ตรวจสอบว่ามีคอลัมน์ last_login_at หรือไม่
      const hasLastLoginAtColumn = await queryRunner.hasColumn('line_profiles', 'last_login_at');
      if (!hasLastLoginAtColumn) {
        await queryRunner.query(`ALTER TABLE line_profiles ADD COLUMN last_login_at TIMESTAMP NULL`);
      }
    }

    // ตรวจสอบว่ามีตาราง line_users หรือไม่
    const hasLineUsersTable = await queryRunner.hasTable('line_users');
    if (hasLineUsersTable) {
      // ตรวจสอบว่ามีคอลัมน์ access_token หรือไม่
      const hasAccessTokenColumn = await queryRunner.hasColumn('line_users', 'access_token');
      if (!hasAccessTokenColumn) {
        await queryRunner.query(`ALTER TABLE line_users ADD COLUMN access_token TEXT NULL`);
      }

      // ตรวจสอบว่ามีคอลัมน์ token_expires_at หรือไม่
      const hasTokenExpiresAtColumn = await queryRunner.hasColumn('line_users', 'token_expires_at');
      if (!hasTokenExpiresAtColumn) {
        await queryRunner.query(`ALTER TABLE line_users ADD COLUMN token_expires_at TIMESTAMP NULL`);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ย้อนกลับการเปลี่ยนแปลง
    const hasLineProfilesTable = await queryRunner.hasTable('line_profiles');
    if (hasLineProfilesTable) {
      const hasStatusMessageColumn = await queryRunner.hasColumn('line_profiles', 'status_message');
      if (hasStatusMessageColumn) {
        await queryRunner.query(`ALTER TABLE line_profiles DROP COLUMN status_message`);
      }

      const hasLastLoginAtColumn = await queryRunner.hasColumn('line_profiles', 'last_login_at');
      if (hasLastLoginAtColumn) {
        await queryRunner.query(`ALTER TABLE line_profiles DROP COLUMN last_login_at`);
      }
    }

    const hasLineUsersTable = await queryRunner.hasTable('line_users');
    if (hasLineUsersTable) {
      const hasAccessTokenColumn = await queryRunner.hasColumn('line_users', 'access_token');
      if (hasAccessTokenColumn) {
        await queryRunner.query(`ALTER TABLE line_users DROP COLUMN access_token`);
      }

      const hasTokenExpiresAtColumn = await queryRunner.hasColumn('line_users', 'token_expires_at');
      if (hasTokenExpiresAtColumn) {
        await queryRunner.query(`ALTER TABLE line_users DROP COLUMN token_expires_at`);
      }
    }
  }
}
