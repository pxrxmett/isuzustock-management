import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedStaffData1762893000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ISUZU Staff
    await queryRunner.query(`
      INSERT INTO staff (brand_id, employee_code, full_name, full_name_en, email, phone, role, status) VALUES
      (1, 'ISU001', 'สมชาย ใจดี', 'Somchai Jaidee', 'somchai.j@noknguekotto.com', '0812345678', 'manager', 'active'),
      (1, 'ISU002', 'สมหญิง รักดี', 'Somying Rakdee', 'somying.r@noknguekotto.com', '0823456789', 'sales', 'active'),
      (1, 'ISU003', 'วิชัย มั่นคง', 'Vichai Munkong', 'vichai.m@noknguekotto.com', '0834567890', 'sales', 'active'),
      (1, 'ISU004', 'ประภา สว่างใจ', 'Prapa Swangjai', 'prapa.s@noknguekotto.com', '0845678901', 'sales', 'on_leave')
    `);

    // BYD Staff
    await queryRunner.query(`
      INSERT INTO staff (brand_id, employee_code, full_name, full_name_en, email, phone, role, status) VALUES
      (2, 'BYD001', 'มานี ไฟฟ้า', 'Manee Faifa', 'manee.f@noknguekotto.com', '0856789012', 'manager', 'active'),
      (2, 'BYD002', 'สุดา อีวี', 'Suda EV', 'suda.e@noknguekotto.com', '0867890123', 'sales', 'active'),
      (2, 'BYD003', 'ประยุทธ์ ไฟฟ้า', 'Prayut Faifa', 'prayut.f@noknguekotto.com', '0878901234', 'sales', 'active'),
      (2, 'BYD004', 'จินดา โปร', 'Jinda Pro', 'jinda.p@noknguekotto.com', '0889012345', 'sales', 'inactive')
    `);

    // Admin User (cross-brand access)
    await queryRunner.query(`
      INSERT INTO staff (brand_id, employee_code, full_name, full_name_en, email, phone, role, status) VALUES
      (1, 'ADMIN001', 'ผู้ดูแลระบบ', 'System Admin', 'admin@noknguekotto.com', '0801234567', 'admin', 'active')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete seeded data
    await queryRunner.query(`
      DELETE FROM staff WHERE employee_code IN (
        'ISU001', 'ISU002', 'ISU003', 'ISU004',
        'BYD001', 'BYD002', 'BYD003', 'BYD004',
        'ADMIN001'
      )
    `);
  }
}
