import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddBrandIdToVehicles1762872964062 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add brand_id column with default value 1 (ISUZU) for existing data
    await queryRunner.addColumn(
      'vehicles',
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
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_BRAND_ID',
        columnNames: ['brand_id'],
      }),
    );

    // Create composite index for brand_id + status (for faster filtering)
    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'IDX_VEHICLE_BRAND_STATUS',
        columnNames: ['brand_id', 'status'],
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'vehicles',
      new TableForeignKey({
        name: 'FK_VEHICLES_BRAND',
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('vehicles', 'FK_VEHICLES_BRAND');

    // Drop indexes
    await queryRunner.dropIndex('vehicles', 'IDX_VEHICLE_BRAND_STATUS');
    await queryRunner.dropIndex('vehicles', 'IDX_VEHICLE_BRAND_ID');

    // Drop column
    await queryRunner.dropColumn('vehicles', 'brand_id');
  }
}
