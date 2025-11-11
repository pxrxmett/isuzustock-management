import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddCoordinatorToEvents1762892000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add coordinator_staff_id column
    await queryRunner.addColumn(
      'events',
      new TableColumn({
        name: 'coordinator_staff_id',
        type: 'int',
        unsigned: true,
        isNullable: true,
        default: null,
        comment: 'Staff coordinating this event',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'IDX_EVENT_COORDINATOR_STAFF',
        columnNames: ['coordinator_staff_id'],
      }),
    );

    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'IDX_EVENT_BRAND_COORDINATOR',
        columnNames: ['brand_id', 'coordinator_staff_id'],
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'events',
      new TableForeignKey({
        name: 'FK_EVENTS_COORDINATOR_STAFF',
        columnNames: ['coordinator_staff_id'],
        referencedTableName: 'staff',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('events', 'FK_EVENTS_COORDINATOR_STAFF');

    // Drop indexes
    await queryRunner.dropIndex('events', 'IDX_EVENT_BRAND_COORDINATOR');
    await queryRunner.dropIndex('events', 'IDX_EVENT_COORDINATOR_STAFF');

    // Drop column
    await queryRunner.dropColumn('events', 'coordinator_staff_id');
  }
}
