import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateUserSettingsTable1745830100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // สร้างตาราง user_settings
    await queryRunner.createTable(
      new Table({
        name: 'user_settings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '36',
          },
          // Notification settings
          {
            name: 'notify_email',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notify_line',
            type: 'boolean',
            default: false,
          },
          {
            name: 'notify_new_queue',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notify_queue_status',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notify_events',
            type: 'boolean',
            default: true,
          },
          // System settings
          {
            name: 'language',
            type: 'varchar',
            length: '5',
            default: "'th'",
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '50',
            default: "'Asia/Bangkok'",
          },
          {
            name: 'date_format',
            type: 'varchar',
            length: '20',
            default: "'DD/MM/YYYY'",
          },
          {
            name: 'dark_mode',
            type: 'boolean',
            default: false,
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
      true,
    );

    // สร้าง unique index สำหรับ user_id
    await queryRunner.createIndex(
      'user_settings',
      new TableIndex({
        name: 'IDX_user_settings_user_id',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );

    // สร้าง Foreign Key ไปที่ users table
    await queryRunner.createForeignKey(
      'user_settings',
      new TableForeignKey({
        name: 'FK_user_settings_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    console.log('✅ User settings table created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_settings', 'FK_user_settings_user_id');
    await queryRunner.dropIndex('user_settings', 'IDX_user_settings_user_id');
    await queryRunner.dropTable('user_settings');
  }
}
