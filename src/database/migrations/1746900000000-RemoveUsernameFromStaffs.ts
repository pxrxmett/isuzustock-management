import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveUsernameFromStaffs1746900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ตรวจสอบว่าคอลัมน์ username มีอยู่หรือไม่
    const table = await queryRunner.getTable('staffs');
    const hasUsernameColumn = table?.findColumnByName('username');

    if (hasUsernameColumn) {
      console.log('พบคอลัมน์ username ในตาราง staffs กำลังลบ...');

      // ลบคอลัมน์ username
      await queryRunner.dropColumn('staffs', 'username');

      console.log('ลบคอลัมน์ username จากตาราง staffs สำเร็จ');
    } else {
      console.log('ไม่พบคอลัมน์ username ในตาราง staffs (ข้ามการลบ)');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ตรวจสอบว่าคอลัมน์ username ไม่มีอยู่
    const table = await queryRunner.getTable('staffs');
    const hasUsernameColumn = table?.findColumnByName('username');

    if (!hasUsernameColumn) {
      console.log('กำลังเพิ่มคอลัมน์ username กลับเข้าไปในตาราง staffs...');

      // เพิ่มคอลัมน์ username กลับ (สำหรับ rollback)
      await queryRunner.addColumn('staffs', new TableColumn({
        name: 'username',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }));

      console.log('เพิ่มคอลัมน์ username กลับเข้าไปในตาราง staffs สำเร็จ');
    } else {
      console.log('คอลัมน์ username มีอยู่แล้วในตาราง staffs (ข้ามการเพิ่ม)');
    }
  }
}
