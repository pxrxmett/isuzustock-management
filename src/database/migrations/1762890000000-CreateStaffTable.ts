import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateStaffTable1762890000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create staff table
    await queryRunner.createTable(
      new Table({
        name: 'staff',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'brand_id',
            type: 'int',
            isNullable: false,
            comment: 'Brand affiliation (1=ISUZU, 2=BYD)',
          },
          {
            name: 'employee_code',
            type: 'varchar',
            length: '20',
            isUnique: true,
            isNullable: false,
            comment: 'Unique employee code (e.g., ISU001, BYD001)',
          },
          {
            name: 'full_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Full name in Thai',
          },
          {
            name: 'full_name_en',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Full name in English',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
            comment: 'Email address (unique)',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
            comment: 'Phone number',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'manager', 'sales'],
            default: "'sales'",
            isNullable: false,
            comment: 'Staff role',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'on_leave'],
            default: "'active'",
            isNullable: false,
            comment: 'Employment status',
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '255',
            isNullable: true,
            default: null,
            comment: 'Profile picture URL',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_BRAND_ID',
        columnNames: ['brand_id'],
      }),
    );

    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_BRAND_ROLE',
        columnNames: ['brand_id', 'role'],
      }),
    );

    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_BRAND_STATUS',
        columnNames: ['brand_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_ROLE',
        columnNames: ['role'],
      }),
    );

    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_STATUS',
        columnNames: ['status'],
      }),
    );

    // Create foreign key to brands
    await queryRunner.createForeignKey(
      'staff',
      new TableForeignKey({
        name: 'FK_STAFF_BRAND',
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
    await queryRunner.dropForeignKey('staff', 'FK_STAFF_BRAND');

    // Drop indexes
    await queryRunner.dropIndex('staff', 'IDX_STAFF_STATUS');
    await queryRunner.dropIndex('staff', 'IDX_STAFF_ROLE');
    await queryRunner.dropIndex('staff', 'IDX_STAFF_BRAND_STATUS');
    await queryRunner.dropIndex('staff', 'IDX_STAFF_BRAND_ROLE');
    await queryRunner.dropIndex('staff', 'IDX_STAFF_BRAND_ID');

    // Drop table
    await queryRunner.dropTable('staff');
  }
}
