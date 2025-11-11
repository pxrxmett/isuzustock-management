import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddBrandIdToEvents1762873011619 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add brand_id column with default value 1 (ISUZU) for existing data
    await queryRunner.addColumn(
      'events',
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
      'events',
      new TableIndex({
        name: 'IDX_EVENT_BRAND_ID',
        columnNames: ['brand_id'],
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'events',
      new TableForeignKey({
        name: 'FK_EVENTS_BRAND',
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('events', 'FK_EVENTS_BRAND');
    await queryRunner.dropIndex('events', 'IDX_EVENT_BRAND_ID');
    await queryRunner.dropColumn('events', 'brand_id');
  }
}
