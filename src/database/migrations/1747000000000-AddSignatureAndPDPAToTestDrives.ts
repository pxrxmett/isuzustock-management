import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSignatureAndPDPAToTestDrives1747000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add customer_license_number column
    await queryRunner.addColumn(
      'test_drives',
      new TableColumn({
        name: 'customer_license_number',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Add notes column
    await queryRunner.addColumn(
      'test_drives',
      new TableColumn({
        name: 'notes',
        type: 'text',
        isNullable: true,
      }),
    );

    // Add pdpa_consent column
    await queryRunner.addColumn(
      'test_drives',
      new TableColumn({
        name: 'pdpa_consent',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    // Add pdpa_consented_at column
    await queryRunner.addColumn(
      'test_drives',
      new TableColumn({
        name: 'pdpa_consented_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Add signature_data column (for base64 string or URL)
    await queryRunner.addColumn(
      'test_drives',
      new TableColumn({
        name: 'signature_data',
        type: 'longtext',
        isNullable: true,
      }),
    );

    // Add signed_at column
    await queryRunner.addColumn(
      'test_drives',
      new TableColumn({
        name: 'signed_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('test_drives', 'signed_at');
    await queryRunner.dropColumn('test_drives', 'signature_data');
    await queryRunner.dropColumn('test_drives', 'pdpa_consented_at');
    await queryRunner.dropColumn('test_drives', 'pdpa_consent');
    await queryRunner.dropColumn('test_drives', 'notes');
    await queryRunner.dropColumn('test_drives', 'customer_license_number');
  }
}
