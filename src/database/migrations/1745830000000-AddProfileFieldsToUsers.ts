import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfileFieldsToUsers1745830000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // เพิ่ม phone column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

    // เพิ่ม position column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'position',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    // เพิ่ม nickname column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'nickname',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    console.log('✅ Added profile fields (phone, position, nickname) to users table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'nickname');
    await queryRunner.dropColumn('users', 'position');
    await queryRunner.dropColumn('users', 'phone');
  }
}
