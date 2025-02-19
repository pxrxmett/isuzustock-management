// src/database/migrations/1738954095421-CreateTestDrives.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTestDrives1738954095421 implements MigrationInterface {
 public async up(queryRunner: QueryRunner): Promise<void> {
   await queryRunner.createTable(
     new Table({
       name: 'test_drives',
       columns: [
         {
           name: 'id',
           type: 'int',
           isPrimary: true,
           isGenerated: true,
           generationStrategy: 'increment',
         },
         {
           name: 'vehicle_id',
           type: 'int',
         },
         {
           name: 'customer_name', 
           type: 'varchar',
           length: '255',
         },
         {
           name: 'customer_phone',
           type: 'varchar',
           length: '20',
         },
         {
           name: 'start_time',
           type: 'datetime',
         },
         {
           name: 'expected_end_time',
           type: 'datetime',
         },
         {
           name: 'actual_end_time',
           type: 'datetime',
           isNullable: true,
         },
         {
           name: 'test_route',
           type: 'varchar',
           length: '255',
           isNullable: true,
         },
         {
           name: 'distance',
           type: 'decimal',
           precision: 10,
           scale: 2,
           isNullable: true,
         },
         {
           name: 'duration',
           type: 'int',
           isNullable: true,
         },
         {
           name: 'responsible_staff',
           type: 'varchar',
           length: '255',
         },
         {
           name: 'status',
           type: 'enum',
           enum: ['pending', 'ongoing', 'completed', 'cancelled'],
           default: "'pending'",
         },
         {
           name: 'created_at',
           type: 'timestamp',
           default: 'CURRENT_TIMESTAMP',
         },
         {
           name: 'updated_at',
           type: 'timestamp',
           default: 'CURRENT_TIMESTAMP',
           onUpdate: 'CURRENT_TIMESTAMP',
         },
       ],
     }),
   );

   await queryRunner.createForeignKey(
     'test_drives',
     new TableForeignKey({
       name: 'FK_test_drives_vehicle',
       columnNames: ['vehicle_id'],
       referencedColumnNames: ['id'],
       referencedTableName: 'vehicles',
       onDelete: 'RESTRICT',
     }),
   );
 }

 public async down(queryRunner: QueryRunner): Promise<void> {
   await queryRunner.dropForeignKey('test_drives', 'FK_test_drives_vehicle');
   await queryRunner.dropTable('test_drives');
 }
}
