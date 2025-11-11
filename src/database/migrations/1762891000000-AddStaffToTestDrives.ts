import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddStaffToTestDrives1762891000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add assigned_staff_id column
    await queryRunner.addColumn(
      'test_drives',
      new TableColumn({
        name: 'assigned_staff_id',
        type: 'int',
        unsigned: true,
        isNullable: true,
        default: null,
        comment: 'Sales staff assigned to handle this test drive',
      }),
    );

    // Add created_by_staff_id column
    await queryRunner.addColumn(
      'test_drives',
      new TableColumn({
        name: 'created_by_staff_id',
        type: 'int',
        unsigned: true,
        isNullable: true,
        default: null,
        comment: 'Staff who created this test drive booking',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'test_drives',
      new TableIndex({
        name: 'IDX_TEST_DRIVE_ASSIGNED_STAFF',
        columnNames: ['assigned_staff_id'],
      }),
    );

    await queryRunner.createIndex(
      'test_drives',
      new TableIndex({
        name: 'IDX_TEST_DRIVE_CREATED_BY_STAFF',
        columnNames: ['created_by_staff_id'],
      }),
    );

    await queryRunner.createIndex(
      'test_drives',
      new TableIndex({
        name: 'IDX_TEST_DRIVE_BRAND_ASSIGNED_STAFF',
        columnNames: ['brand_id', 'assigned_staff_id'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'test_drives',
      new TableForeignKey({
        name: 'FK_TEST_DRIVES_ASSIGNED_STAFF',
        columnNames: ['assigned_staff_id'],
        referencedTableName: 'staff',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'test_drives',
      new TableForeignKey({
        name: 'FK_TEST_DRIVES_CREATED_BY_STAFF',
        columnNames: ['created_by_staff_id'],
        referencedTableName: 'staff',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('test_drives', 'FK_TEST_DRIVES_CREATED_BY_STAFF');
    await queryRunner.dropForeignKey('test_drives', 'FK_TEST_DRIVES_ASSIGNED_STAFF');

    // Drop indexes
    await queryRunner.dropIndex('test_drives', 'IDX_TEST_DRIVE_BRAND_ASSIGNED_STAFF');
    await queryRunner.dropIndex('test_drives', 'IDX_TEST_DRIVE_CREATED_BY_STAFF');
    await queryRunner.dropIndex('test_drives', 'IDX_TEST_DRIVE_ASSIGNED_STAFF');

    // Drop columns
    await queryRunner.dropColumn('test_drives', 'created_by_staff_id');
    await queryRunner.dropColumn('test_drives', 'assigned_staff_id');
  }
}
