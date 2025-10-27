import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEventVehiclesTable1745828100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // สร้างตาราง event_vehicles (join table)
    await queryRunner.createTable(
      new Table({
        name: 'event_vehicles',
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
            name: 'eventId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'vehicleId',
            type: 'int',
          },
          {
            name: 'assignedBy',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'assignedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Unique constraint - ห้ามมีรถคันเดียวใน event เดียวกันซ้ำ
    await queryRunner.createIndex(
      'event_vehicles',
      new TableIndex({
        name: 'IDX_event_vehicles_unique',
        columnNames: ['eventId', 'vehicleId'],
        isUnique: true,
      }),
    );

    // Foreign key to events
    await queryRunner.createForeignKey(
      'event_vehicles',
      new TableForeignKey({
        name: 'FK_event_vehicles_eventId',
        columnNames: ['eventId'],
        referencedTableName: 'events',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Foreign key to vehicles
    await queryRunner.createForeignKey(
      'event_vehicles',
      new TableForeignKey({
        name: 'FK_event_vehicles_vehicleId',
        columnNames: ['vehicleId'],
        referencedTableName: 'vehicles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    console.log('✅ Event-Vehicles join table created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('event_vehicles', 'FK_event_vehicles_vehicleId');
    await queryRunner.dropForeignKey('event_vehicles', 'FK_event_vehicles_eventId');
    await queryRunner.dropIndex('event_vehicles', 'IDX_event_vehicles_unique');
    await queryRunner.dropTable('event_vehicles');
  }
}
