import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddBrandIdToVehicles1762872964062 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add brand_id column with default value 1 (ISUZU) for existing data
    await queryRunner.addColumn(
      'vehicle',  // ✅ แก้เป็น singular (ไม่มี s)
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
      'vehicle',  // ✅ แก้เป็น singular (ไม่มี s)
      new TableIndex({
        name: 'IDX_VEHICLE_BRAND_ID',
        columnNames: ['brand_id'],
      }),
    );

    // Create composite index for brand_id + status (for faster filtering)
    await queryRunner.createIndex(
      'vehicle',  // ✅ แก้เป็น singular (ไม่มี s)
      new TableIndex({
        name: 'IDX_VEHICLE_BRAND_STATUS',
        columnNames: ['brand_id', 'status'],
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'vehicle',  // ✅ แก้เป็น singular (ไม่มี s)
      new TableForeignKey({
        name: 'FK_VEHICLE_BRAND',  // ✅ แก้ชื่อ FK ด้วย
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
    await queryRunner.dropForeignKey('vehicle', 'FK_VEHICLE_BRAND');  // ✅ แก้เป็น singular

    // Drop indexes
    await queryRunner.dropIndex('vehicle', 'IDX_VEHICLE_BRAND_STATUS');  // ✅ แก้เป็น singular
    await queryRunner.dropIndex('vehicle', 'IDX_VEHICLE_BRAND_ID');  // ✅ แก้เป็น singular

    // Drop column
    await queryRunner.dropColumn('vehicle', 'brand_id');  // ✅ แก้เป็น singular
  }
}
