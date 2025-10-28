import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEventFieldsToVehicles1745828200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // เพิ่ม enum values ใหม่ให้กับ status
    await queryRunner.query(`
      ALTER TABLE vehicle
      MODIFY COLUMN status ENUM('available', 'unavailable', 'in_use', 'maintenance', 'locked_for_event')
      DEFAULT 'available'
    `);

    // เพิ่มคอลัมน์สำหรับ event locking
    await queryRunner.addColumn(
      'vehicle',
      new TableColumn({
        name: 'isLockedForEvent',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'vehicle',
      new TableColumn({
        name: 'currentEventId',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'vehicle',
      new TableColumn({
        name: 'eventLockStartDate',
        type: 'datetime',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'vehicle',
      new TableColumn({
        name: 'eventLockEndDate',
        type: 'datetime',
        isNullable: true,
      }),
    );

    console.log('✅ Event-related fields added to vehicle table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('vehicle', 'eventLockEndDate');
    await queryRunner.dropColumn('vehicle', 'eventLockStartDate');
    await queryRunner.dropColumn('vehicle', 'currentEventId');
    await queryRunner.dropColumn('vehicle', 'isLockedForEvent');

    // Revert enum to original values
    await queryRunner.query(`
      ALTER TABLE vehicle
      MODIFY COLUMN status ENUM('available', 'unavailable', 'in_use')
      DEFAULT 'available'
    `);
  }
}
