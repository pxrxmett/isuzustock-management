-- ==============================================================================
-- Fix Foreign Key Constraint Error
-- Problem: test_drives.responsible_staff references non-existent staff.id
-- ==============================================================================

-- Step 1: Check problematic test_drives records
SELECT '🔍 Checking test_drives with invalid staff references...' AS step;

SELECT
  td.id,
  td.responsible_staff,
  td.customer_name,
  td.status,
  'Invalid - Staff Not Found' AS issue
FROM test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
WHERE s.id IS NULL;

-- Step 2: Count problematic records
SELECT COUNT(*) AS problematic_records
FROM test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
WHERE s.id IS NULL;

-- ==============================================================================
-- Solution Options (Choose ONE):
-- ==============================================================================

-- OPTION 1: Delete test_drives with invalid staff references (RECOMMENDED)
-- Use this if the data is old/test data
/*
DELETE td FROM test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
WHERE s.id IS NULL;

SELECT '✅ Deleted invalid test_drives records' AS result;
*/

-- OPTION 2: Create dummy staff for orphaned test_drives
-- Use this if you want to keep the test_drive records
/*
-- Insert a dummy staff member
INSERT INTO staff (
  id,
  staff_code,
  first_name,
  last_name,
  position,
  department,
  phone,
  email,
  role,
  status
) VALUES (
  'DUMMY-STAFF-ID',
  'DUMMY001',
  'Dummy',
  'Staff',
  'Sales',
  'Sales',
  '0000000000',
  'dummy@example.com',
  'staff',
  'inactive'
) ON DUPLICATE KEY UPDATE id = id;

-- Update test_drives to use dummy staff
UPDATE test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
SET td.responsible_staff = 'DUMMY-STAFF-ID'
WHERE s.id IS NULL;

SELECT '✅ Updated orphaned test_drives to use dummy staff' AS result;
*/

-- OPTION 3: Make responsible_staff nullable (if business logic allows)
-- This requires updating the entity
/*
ALTER TABLE test_drives
MODIFY COLUMN responsible_staff VARCHAR(255) NULL;

SELECT '✅ Made responsible_staff nullable' AS result;
*/

-- ==============================================================================
-- Verification
-- ==============================================================================

-- Check if foreign key constraint can be created now
SELECT '🔍 Checking if all test_drives have valid staff references...' AS step;

SELECT
  COUNT(*) AS valid_records
FROM test_drives td
INNER JOIN staff s ON td.responsible_staff = s.id;

SELECT
  COUNT(*) AS total_records
FROM test_drives;

-- If valid_records = total_records, you're good to go!
