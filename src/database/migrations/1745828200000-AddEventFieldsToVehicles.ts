import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEventFieldsToVehicles1745828200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // เพิ่ม enum values ใหม่ให้กับ status
    await queryRunner.query(`
      ALTER TABLE vehicles
      MODIFY COLUMN status ENUM('available', 'unavailable', 'in_use', 'maintenance', 'locked_for_event')
      DEFAULT 'available'
    `);

    // เพิ่มคอลัมน์สำหรับ event locking
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'isLockedForEvent',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'currentEventId',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'eventLockStartDate',
        type: 'datetime',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'eventLockEndDate',
        type: 'datetime',
        isNullable: true,
      }),
    );

    console.log('✅ Event-related fields added to vehicles table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('vehicles', 'eventLockEndDate');
    await queryRunner.dropColumn('vehicles', 'eventLockStartDate');
    await queryRunner.dropColumn('vehicles', 'currentEventId');
    await queryRunner.dropColumn('vehicles', 'isLockedForEvent');

    // Revert enum to original values
    await queryRunner.query(`
      ALTER TABLE vehicles
      MODIFY COLUMN status ENUM('available', 'unavailable', 'in_use')
      DEFAULT 'available'
    `);
  }
}
