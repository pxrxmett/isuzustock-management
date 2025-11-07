-- ==============================================================================
-- Quick Link: เชื่อมโยง LINE User ID กับ Staff (แบบเร็ว)
-- ==============================================================================
-- แก้ไขค่า 3 ตัวนี้แล้ว run ได้เลย:

SET @staff_code = 'STAFF001';                    -- ← รหัสพนักงาน
SET @line_user_id = 'U1234567890abcdef';         -- ← LINE User ID
SET @line_display_name = 'John Doe';             -- ← ชื่อที่แสดงใน LINE

-- Run:
UPDATE staffs
SET
  line_user_id = @line_user_id,
  line_display_name = @line_display_name,
  line_last_login_at = NOW(),
  is_line_linked = 1
WHERE staff_code = @staff_code;

-- Verify:
SELECT
  staff_code,
  CONCAT(first_name, ' ', last_name) AS full_name,
  line_user_id,
  line_display_name,
  CASE WHEN is_line_linked = 1 THEN '✅ Linked' ELSE '❌ Not Linked' END AS status
FROM staffs
WHERE staff_code = @staff_code;
