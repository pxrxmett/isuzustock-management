import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupTestDriveStaffData1762894000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔍 Checking for orphaned staff references in test_drives...');

    // Step 1: Check if responsible_staff column exists and has data
    const testDrivesTable = await queryRunner.getTable('test_drives');
    const hasResponsibleStaff = testDrivesTable?.columns.find(
      (col) => col.name === 'responsible_staff',
    );

    if (hasResponsibleStaff) {
      // Step 2: Find all test_drives with invalid responsible_staff references
      const invalidRecords = await queryRunner.query(`
        SELECT td.id, td.responsible_staff
        FROM test_drives td
        LEFT JOIN staff s ON td.responsible_staff = s.id
        WHERE td.responsible_staff IS NOT NULL
          AND s.id IS NULL
      `);

      if (invalidRecords.length > 0) {
        console.log(
          `⚠️  Found ${invalidRecords.length} test_drives with invalid responsible_staff references:`,
        );
        console.log(invalidRecords);

        // Step 3: Set invalid references to NULL
        await queryRunner.query(`
          UPDATE test_drives td
          LEFT JOIN staff s ON td.responsible_staff = s.id
          SET td.responsible_staff = NULL
          WHERE td.responsible_staff IS NOT NULL
            AND s.id IS NULL
        `);

        console.log(
          `✅ Set ${invalidRecords.length} invalid responsible_staff references to NULL`,
        );
      } else {
        console.log('✅ No invalid responsible_staff references found');
      }

      // Step 4: Migrate data from responsible_staff to assigned_staff_id if needed
      const hasAssignedStaffId = testDrivesTable?.columns.find(
        (col) => col.name === 'assigned_staff_id',
      );

      if (hasAssignedStaffId) {
        // Copy valid responsible_staff to assigned_staff_id
        await queryRunner.query(`
          UPDATE test_drives td
          INNER JOIN staff s ON td.responsible_staff = s.id
          SET td.assigned_staff_id = td.responsible_staff
          WHERE td.responsible_staff IS NOT NULL
            AND td.assigned_staff_id IS NULL
        `);

        console.log('✅ Migrated responsible_staff to assigned_staff_id');
      }
    }

    // Step 5: Clean up assigned_staff_id and created_by_staff_id if they exist
    const hasAssignedStaffId = testDrivesTable?.columns.find(
      (col) => col.name === 'assigned_staff_id',
    );
    const hasCreatedByStaffId = testDrivesTable?.columns.find(
      (col) => col.name === 'created_by_staff_id',
    );

    if (hasAssignedStaffId) {
      const invalidAssigned = await queryRunner.query(`
        SELECT td.id, td.assigned_staff_id
        FROM test_drives td
        LEFT JOIN staff s ON td.assigned_staff_id = s.id
        WHERE td.assigned_staff_id IS NOT NULL
          AND s.id IS NULL
      `);

      if (invalidAssigned.length > 0) {
        console.log(
          `⚠️  Found ${invalidAssigned.length} test_drives with invalid assigned_staff_id:`,
        );
        console.log(invalidAssigned);

        await queryRunner.query(`
          UPDATE test_drives td
          LEFT JOIN staff s ON td.assigned_staff_id = s.id
          SET td.assigned_staff_id = NULL
          WHERE td.assigned_staff_id IS NOT NULL
            AND s.id IS NULL
        `);

        console.log(`✅ Set ${invalidAssigned.length} invalid assigned_staff_id to NULL`);
      }
    }

    if (hasCreatedByStaffId) {
      const invalidCreatedBy = await queryRunner.query(`
        SELECT td.id, td.created_by_staff_id
        FROM test_drives td
        LEFT JOIN staff s ON td.created_by_staff_id = s.id
        WHERE td.created_by_staff_id IS NOT NULL
          AND s.id IS NULL
      `);

      if (invalidCreatedBy.length > 0) {
        console.log(
          `⚠️  Found ${invalidCreatedBy.length} test_drives with invalid created_by_staff_id:`,
        );
        console.log(invalidCreatedBy);

        await queryRunner.query(`
          UPDATE test_drives td
          LEFT JOIN staff s ON td.created_by_staff_id = s.id
          SET td.created_by_staff_id = NULL
          WHERE td.created_by_staff_id IS NOT NULL
            AND s.id IS NULL
        `);

        console.log(`✅ Set ${invalidCreatedBy.length} invalid created_by_staff_id to NULL`);
      }
    }

    console.log('✅ Test drives staff data cleanup completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('⚠️  This migration cleanup cannot be reversed');
    // No down migration - we can't restore invalid references
  }
}
