import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

/**
 * Migration: EnsureVehicleBrandId
 *
 * Purpose: เพิ่ม brand_id column และ Foreign Key ให้กับ vehicle table
 * สำหรับ Railway database ที่อาจยังไม่มี column นี้
 *
 * Features:
 * - ตรวจสอบว่ามี column อยู่แล้วหรือไม่ (idempotent)
 * - เพิ่ม brand_id column (int NOT NULL DEFAULT 1)
 * - เพิ่ม Foreign Key ไปที่ brands(id)
 * - เพิ่ม Index สำหรับ performance
 */
export class EnsureVehicleBrandId1732234800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔍 Checking if vehicle.brand_id column exists...');

    // ตรวจสอบว่า column มีอยู่แล้วหรือไม่
    const table = await queryRunner.getTable('vehicle');
    const brandIdColumn = table?.findColumnByName('brand_id');

    if (brandIdColumn) {
      console.log('✅ vehicle.brand_id column already exists. Skipping migration.');
      return;
    }

    console.log('🔧 Adding brand_id column to vehicle table...');

    // เพิ่ม brand_id column
    await queryRunner.addColumn(
      'vehicle',
      new TableColumn({
        name: 'brand_id',
        type: 'int',
        isNullable: false,
        default: 1,
        comment: 'Reference to brands table',
      }),
    );

    console.log('✅ brand_id column added successfully');
    console.log('🔧 Creating foreign key constraint...');

    // เพิ่ม Foreign Key
    await queryRunner.createForeignKey(
      'vehicle',
      new TableForeignKey({
        name: 'FK_VEHICLE_BRAND',
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    console.log('✅ Foreign key created successfully');
    console.log('🔧 Creating index on brand_id...');

    // เพิ่ม Index
    await queryRunner.query(`
      CREATE INDEX IDX_VEHICLE_BRAND_ID ON vehicle(brand_id)
    `);

    console.log('✅ Index created successfully');
    console.log('✅ Migration EnsureVehicleBrandId completed!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back EnsureVehicleBrandId migration...');

    // ตรวจสอบว่า column มีอยู่หรือไม่
    const table = await queryRunner.getTable('vehicle');
    const brandIdColumn = table?.findColumnByName('brand_id');

    if (!brandIdColumn) {
      console.log('✅ brand_id column does not exist. Nothing to rollback.');
      return;
    }

    console.log('🔧 Dropping index...');
    await queryRunner.query(`DROP INDEX IDX_VEHICLE_BRAND_ID ON vehicle`);

    console.log('🔧 Dropping foreign key...');
    const foreignKey = table?.foreignKeys.find(
      fk => fk.columnNames.indexOf('brand_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('vehicle', foreignKey);
    }

    console.log('🔧 Dropping brand_id column...');
    await queryRunner.dropColumn('vehicle', 'brand_id');

    console.log('✅ Rollback completed');
  }
}
