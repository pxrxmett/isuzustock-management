import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateUsersTable1745827200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // สร้างตาราง users
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'username',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'manager', 'staff', 'user'],
            default: "'user'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended'],
            default: "'active'",
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
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

    // สร้าง indexes
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_username',
        columnNames: ['username'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    // สร้าง default admin user (รหัสผ่าน: Admin@123456)
    const passwordHash = await bcrypt.hash('Admin@123456', 10);

    await queryRunner.query(
      `INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, status)
       VALUES (UUID(), 'admin', 'admin@isuzustock.com', ?, 'System', 'Administrator', 'admin', 'active')`,
      [passwordHash]
    );

    console.log('✅ Default admin user created:');
    console.log('   Username: admin');
    console.log('   Password: Admin@123456');
    console.log('   ⚠️  Please change this password after first login!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_email');
    await queryRunner.dropIndex('users', 'IDX_users_username');
    await queryRunner.dropTable('users');
  }
}
