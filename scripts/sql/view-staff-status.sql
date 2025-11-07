-- ==============================================================================
-- View Staff Status: ดูข้อมูล Staff และสถานะการเชื่อมโยง LINE
-- ==============================================================================

-- แสดงข้อมูล Staff ทั้งหมดพร้อมสถานะการเชื่อมโยง LINE
SELECT
  staff_code AS 'รหัสพนักงาน',
  CONCAT(first_name, ' ', last_name) AS 'ชื่อ-นามสกุล',
  department AS 'แผนก',
  position AS 'ตำแหน่ง',
  email AS 'อีเมล',
  phone AS 'เบอร์โทร',
  status AS 'สถานะ',
  CASE
    WHEN line_user_id IS NOT NULL AND is_line_linked = 1 THEN '✅ เชื่อมโยงแล้ว'
    WHEN line_user_id IS NOT NULL AND is_line_linked = 0 THEN '⚠️ มี LINE ID แต่ไม่ได้ลิงก์'
    ELSE '❌ ยังไม่เชื่อมโยง'
  END AS 'สถานะ LINE',
  line_user_id AS 'LINE User ID',
  line_display_name AS 'ชื่อ LINE',
  DATE_FORMAT(line_last_login_at, '%d/%m/%Y %H:%i') AS 'Login ครั้งล่าสุด'
FROM staffs
ORDER BY
  CASE
    WHEN line_user_id IS NULL THEN 1
    WHEN is_line_linked = 0 THEN 2
    ELSE 3
  END,
  staff_code;

-- สรุปสถานะการเชื่อมโยง
SELECT '===== สรุปสถานะการเชื่อมโยง LINE =====' AS summary;

SELECT
  COUNT(*) AS total_staff,
  SUM(CASE WHEN line_user_id IS NOT NULL AND is_line_linked = 1 THEN 1 ELSE 0 END) AS linked,
  SUM(CASE WHEN line_user_id IS NULL OR is_line_linked = 0 THEN 1 ELSE 0 END) AS not_linked,
  CONCAT(
    ROUND(
      SUM(CASE WHEN line_user_id IS NOT NULL AND is_line_linked = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
      2
    ),
    '%'
  ) AS percentage_linked
FROM staffs;

-- Staff ที่ยังไม่เชื่อมโยง LINE
SELECT '===== Staff ที่ยังไม่ได้เชื่อมโยง LINE =====' AS not_linked_staff;

SELECT
  staff_code,
  CONCAT(first_name, ' ', last_name) AS full_name,
  department,
  position,
  email,
  phone
FROM staffs
WHERE line_user_id IS NULL OR is_line_linked = 0
ORDER BY staff_code;

-- Staff ที่เชื่อมโยงแล้ว
SELECT '===== Staff ที่เชื่อมโยงแล้ว =====' AS linked_staff;

SELECT
  staff_code,
  CONCAT(first_name, ' ', last_name) AS full_name,
  department,
  line_display_name,
  DATE_FORMAT(line_last_login_at, '%d/%m/%Y %H:%i') AS last_login
FROM staffs
WHERE line_user_id IS NOT NULL AND is_line_linked = 1
ORDER BY line_last_login_at DESC;
