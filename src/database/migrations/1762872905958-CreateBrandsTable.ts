import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBrandsTable1762872905958 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'brands',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'Brand code (ISUZU, BYD)',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            comment: 'Brand name in English',
          },
          {
            name: 'name_th',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Brand name in Thai',
          },
          {
            name: 'vehicle_type',
            type: 'enum',
            enum: ['fuel', 'electric'],
            comment: 'Type of vehicles (fuel or electric)',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: 'Whether the brand is active',
          },
          {
            name: 'settings',
            type: 'json',
            isNullable: true,
            comment: 'Brand-specific settings',
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

    // Insert default brands
    await queryRunner.query(`
      INSERT INTO brands (code, name, name_th, vehicle_type, is_active, settings) VALUES
      ('ISUZU', 'Isuzu', 'อีซูซุ', 'fuel', true, '{"color": "#E31E24", "icon": "🚗", "models": ["D-MAX", "MU-X", "V-Cross"]}'),
      ('BYD', 'BYD', 'บีวายดี', 'electric', true, '{"color": "#0066CC", "icon": "⚡", "models": ["ATTO 3", "DOLPHIN", "SEAL"]}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('brands');
  }
}
