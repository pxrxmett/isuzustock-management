import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEventsTable1745828000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // สร้างตาราง events
    await queryRunner.createTable(
      new Table({
        name: 'events',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['car_show', 'test_drive', 'marketing', 'delivery', 'emergency'],
            default: "'marketing'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['planning', 'preparing', 'in_progress', 'completed', 'cancelled', 'overdue'],
            default: "'planning'",
          },
          {
            name: 'location',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'startDate',
            type: 'date',
          },
          {
            name: 'endDate',
            type: 'date',
          },
          {
            name: 'startTime',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'endTime',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'assignedStaffIds',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'vehicleCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // สร้าง indexes
    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'IDX_events_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'IDX_events_type',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'IDX_events_startDate',
        columnNames: ['startDate'],
      }),
    );

    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'IDX_events_endDate',
        columnNames: ['endDate'],
      }),
    );

    // Foreign key to staff (creator)
    await queryRunner.createForeignKey(
      'events',
      new TableForeignKey({
        name: 'FK_events_createdBy',
        columnNames: ['createdBy'],
        referencedTableName: 'staffs',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    console.log('✅ Events table created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('events', 'FK_events_createdBy');
    await queryRunner.dropIndex('events', 'IDX_events_endDate');
    await queryRunner.dropIndex('events', 'IDX_events_startDate');
    await queryRunner.dropIndex('events', 'IDX_events_type');
    await queryRunner.dropIndex('events', 'IDX_events_status');
    await queryRunner.dropTable('events');
  }
}
