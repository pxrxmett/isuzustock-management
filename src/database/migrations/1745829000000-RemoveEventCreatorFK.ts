import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEventCreatorFK1745829000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ลบ Foreign Key constraint ระหว่าง events.createdBy กับ staffs.id
    await queryRunner.query(`
      ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_events_createdBy\`
    `);

    console.log('✅ Removed FK constraint from events.createdBy');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // เพิ่ม FK constraint กลับ (ถ้าต้องการ rollback)
    await queryRunner.query(`
      ALTER TABLE \`events\`
      ADD CONSTRAINT \`FK_events_createdBy\`
      FOREIGN KEY (\`createdBy\`) REFERENCES \`staffs\`(\`id\`)
      ON DELETE SET NULL
    `);
  }
}
