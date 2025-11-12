-- ==============================================================================
-- Quick Fix: Delete invalid test_drives records
-- Run this if you don't need the old test_drive data
-- ==============================================================================

USE stock_management;

-- Delete test_drives with invalid staff references
DELETE td FROM test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
WHERE s.id IS NULL;

-- Show result
SELECT 'Fixed!' AS status, ROW_COUNT() AS deleted_records;

-- Verify
SELECT COUNT(*) AS remaining_test_drives FROM test_drives;
