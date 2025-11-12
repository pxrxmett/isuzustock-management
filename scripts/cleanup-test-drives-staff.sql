-- ===================================================================
-- Cleanup Orphaned Staff References in test_drives
-- ===================================================================
-- This script must be run BEFORE starting the application or running migrations
-- that create FK constraints on staff-related columns
-- ===================================================================

-- Step 1: Check for invalid responsible_staff references
SELECT
    '=== Checking invalid responsible_staff references ===' AS step;

SELECT
    td.id,
    td.responsible_staff,
    td.customer_name,
    td.status
FROM test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
WHERE td.responsible_staff IS NOT NULL
  AND s.id IS NULL;

-- Step 2: Fix invalid responsible_staff references (set to NULL)
SELECT
    '=== Fixing invalid responsible_staff references ===' AS step;

UPDATE test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
SET td.responsible_staff = NULL
WHERE td.responsible_staff IS NOT NULL
  AND s.id IS NULL;

-- Step 3: Check for invalid assigned_staff_id references (if column exists)
SELECT
    '=== Checking invalid assigned_staff_id references ===' AS step;

SELECT
    td.id,
    td.assigned_staff_id,
    td.customer_name,
    td.status
FROM test_drives td
LEFT JOIN staff s ON td.assigned_staff_id = s.id
WHERE td.assigned_staff_id IS NOT NULL
  AND s.id IS NULL;

-- Step 4: Fix invalid assigned_staff_id references (set to NULL)
SELECT
    '=== Fixing invalid assigned_staff_id references ===' AS step;

UPDATE test_drives td
LEFT JOIN staff s ON td.assigned_staff_id = s.id
SET td.assigned_staff_id = NULL
WHERE td.assigned_staff_id IS NOT NULL
  AND s.id IS NULL;

-- Step 5: Check for invalid created_by_staff_id references (if column exists)
SELECT
    '=== Checking invalid created_by_staff_id references ===' AS step;

SELECT
    td.id,
    td.created_by_staff_id,
    td.customer_name,
    td.status
FROM test_drives td
LEFT JOIN staff s ON td.created_by_staff_id = s.id
WHERE td.created_by_staff_id IS NOT NULL
  AND s.id IS NULL;

-- Step 6: Fix invalid created_by_staff_id references (set to NULL)
SELECT
    '=== Fixing invalid created_by_staff_id references ===' AS step;

UPDATE test_drives td
LEFT JOIN staff s ON td.created_by_staff_id = s.id
SET td.created_by_staff_id = NULL
WHERE td.created_by_staff_id IS NOT NULL
  AND s.id IS NULL;

-- Step 7: Verify cleanup is complete
SELECT
    '=== Verification: All invalid references should be gone ===' AS step;

-- Check responsible_staff
SELECT
    COUNT(*) as invalid_responsible_staff_count
FROM test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
WHERE td.responsible_staff IS NOT NULL
  AND s.id IS NULL;

-- Check assigned_staff_id
SELECT
    COUNT(*) as invalid_assigned_staff_id_count
FROM test_drives td
LEFT JOIN staff s ON td.assigned_staff_id = s.id
WHERE td.assigned_staff_id IS NOT NULL
  AND s.id IS NULL;

-- Check created_by_staff_id
SELECT
    COUNT(*) as invalid_created_by_staff_id_count
FROM test_drives td
LEFT JOIN staff s ON td.created_by_staff_id = s.id
WHERE td.created_by_staff_id IS NOT NULL
  AND s.id IS NULL;

-- Step 8: Show current state
SELECT
    '=== Current test_drives with staff references ===' AS step;

SELECT
    td.id,
    td.responsible_staff,
    td.assigned_staff_id,
    td.created_by_staff_id,
    td.customer_name,
    td.status,
    s1.full_name as responsible_staff_name,
    s2.full_name as assigned_staff_name,
    s3.full_name as created_by_staff_name
FROM test_drives td
LEFT JOIN staff s1 ON td.responsible_staff = s1.id
LEFT JOIN staff s2 ON td.assigned_staff_id = s2.id
LEFT JOIN staff s3 ON td.created_by_staff_id = s3.id
ORDER BY td.id DESC
LIMIT 20;

SELECT '=== Cleanup Complete! ===' AS result;
