import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddBrandIdToTestDrives1762872987218 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add brand_id column with default value 1 (ISUZU) for existing data
    await queryRunner.addColumn(
      'test_drives',
      new TableColumn({
        name: 'brand_id',
        type: 'int',
        isNullable: false,
        default: 1,
        comment: 'Brand ID (1=ISUZU, 2=BYD)',
      }),
    );

    // Create index for brand_id
    await queryRunner.createIndex(
      'test_drives',
      new TableIndex({
        name: 'IDX_TEST_DRIVE_BRAND_ID',
        columnNames: ['brand_id'],
      }),
    );

    // Create composite index for brand_id + status
    await queryRunner.createIndex(
      'test_drives',
      new TableIndex({
        name: 'IDX_TEST_DRIVE_BRAND_STATUS',
        columnNames: ['brand_id', 'status'],
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'test_drives',
      new TableForeignKey({
        name: 'FK_TEST_DRIVES_BRAND',
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('test_drives', 'FK_TEST_DRIVES_BRAND');
    await queryRunner.dropIndex('test_drives', 'IDX_TEST_DRIVE_BRAND_STATUS');
    await queryRunner.dropIndex('test_drives', 'IDX_TEST_DRIVE_BRAND_ID');
    await queryRunner.dropColumn('test_drives', 'brand_id');
  }
}
