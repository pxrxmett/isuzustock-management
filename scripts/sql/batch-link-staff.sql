-- ==============================================================================
-- Batch Link: เชื่อมโยงหลาย Staff พร้อมกัน
-- ==============================================================================
-- แก้ไขข้อมูลในตารางด้านล่าง แล้ว run script

-- เชื่อมโยงหลาย Staff พร้อมกัน
INSERT INTO staffs (staff_code, line_user_id, line_display_name, line_last_login_at, is_line_linked)
VALUES
  ('STAFF001', 'U1234567890abcdef', 'John Doe', NOW(), 1),
  ('STAFF002', 'U0987654321fedcba', 'Jane Smith', NOW(), 1),
  ('STAFF003', 'U1111222233334444', 'Bob Wilson', NOW(), 1)
ON DUPLICATE KEY UPDATE
  line_user_id = VALUES(line_user_id),
  line_display_name = VALUES(line_display_name),
  line_last_login_at = VALUES(line_last_login_at),
  is_line_linked = VALUES(is_line_linked);

-- หรือใช้วิธี UPDATE แบบทีละคน:

UPDATE staffs SET line_user_id = 'U1234567890abcdef', line_display_name = 'John Doe', line_last_login_at = NOW(), is_line_linked = 1 WHERE staff_code = 'STAFF001';
UPDATE staffs SET line_user_id = 'U0987654321fedcba', line_display_name = 'Jane Smith', line_last_login_at = NOW(), is_line_linked = 1 WHERE staff_code = 'STAFF002';
UPDATE staffs SET line_user_id = 'U1111222233334444', line_display_name = 'Bob Wilson', line_last_login_at = NOW(), is_line_linked = 1 WHERE staff_code = 'STAFF003';

-- Verify all:
SELECT
  staff_code,
  CONCAT(first_name, ' ', last_name) AS full_name,
  line_user_id,
  line_display_name,
  CASE WHEN is_line_linked = 1 THEN '✅' ELSE '❌' END AS linked
FROM staffs
WHERE staff_code IN ('STAFF001', 'STAFF002', 'STAFF003');
