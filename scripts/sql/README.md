# 🗄️ SQL Scripts สำหรับจัดการ LINE Integration

Scripts สำหรับเชื่อมโยง LINE User ID กับข้อมูล Staff ในฐานข้อมูล

---

## 📁 ไฟล์ทั้งหมด

| ไฟล์ | คำอธิบาย | ใช้เมื่อ |
|------|----------|----------|
| `link-line-to-staff.sql` | เชื่อมโยงแบบละเอียด พร้อม validation | เชื่อมโยง Staff คนแรก หรือต้องการเช็คข้อมูลละเอียด |
| `quick-link-staff.sql` | เชื่อมโยงแบบเร็ว (3 บรรทัด) | เชื่อมโยงด่วน ใช้เวลาไม่ถึง 1 นาที |
| `batch-link-staff.sql` | เชื่อมโยงหลาย Staff พร้อมกัน | เชื่อมโยง 10-100 คนพร้อมกัน |
| `view-staff-status.sql` | ดูสถานะการเชื่อมโยงของ Staff | เช็คว่าใครเชื่อมโยงแล้ว ใครยัง |

---

## 🚀 Quick Start

### 1. เชื่อมโยง Staff คนเดียว (แบบเร็ว)

```sql
-- แก้ 3 ค่านี้:
SET @staff_code = 'STAFF001';
SET @line_user_id = 'U1234567890abcdef';
SET @line_display_name = 'John Doe';

-- Run:
UPDATE staffs
SET
  line_user_id = @line_user_id,
  line_display_name = @line_display_name,
  line_last_login_at = NOW(),
  is_line_linked = 1
WHERE staff_code = @staff_code;
```

### 2. เชื่อมโยงหลายคน

```sql
UPDATE staffs SET line_user_id = 'U111', line_display_name = 'John', line_last_login_at = NOW(), is_line_linked = 1 WHERE staff_code = 'STAFF001';
UPDATE staffs SET line_user_id = 'U222', line_display_name = 'Jane', line_last_login_at = NOW(), is_line_linked = 1 WHERE staff_code = 'STAFF002';
UPDATE staffs SET line_user_id = 'U333', line_display_name = 'Bob', line_last_login_at = NOW(), is_line_linked = 1 WHERE staff_code = 'STAFF003';
```

### 3. ดูสถานะ Staff ทั้งหมด

```sql
SELECT
  staff_code,
  CONCAT(first_name, ' ', last_name) AS full_name,
  CASE WHEN is_line_linked = 1 THEN '✅' ELSE '❌' END AS linked,
  line_user_id
FROM staffs
ORDER BY staff_code;
```

---

## 📖 วิธีใช้งานแบบละเอียด

### วิธีที่ 1: Railway Web Console

1. ไปที่ Railway Dashboard → MySQL Service
2. กด **"Data"** tab
3. กด **"Query"**
4. Paste SQL script ที่ต้องการ
5. แก้ค่าตัวแปร (@staff_code, @line_user_id)
6. กด **"Run Query"**

### วิธีที่ 2: Railway CLI

```bash
# Login Railway
railway login

# Link to project
railway link

# Run SQL script
railway run mysql < scripts/sql/quick-link-staff.sql

# Or run command directly
railway run mysql -e "
UPDATE staffs
SET line_user_id = 'U1234567890abcdef'
WHERE staff_code = 'STAFF001';
"
```

### วิธีที่ 3: MySQL Client (Local/Remote)

```bash
# Connect to Railway MySQL
mysql -h mysql.railway.internal \
  -P 3306 \
  -u root \
  -p \
  stock_management < scripts/sql/quick-link-staff.sql

# Or run interactively
mysql -h mysql.railway.internal -u root -p stock_management
mysql> source scripts/sql/quick-link-staff.sql;
```

---

## 🔍 วิธีหา LINE User ID

### วิธีที่ 1: ผ่าน Frontend (LIFF App)

Staff เปิด LIFF App → F12 (Developer Tools) → Console:

```javascript
liff.getProfile().then(profile => {
  console.log('========================================');
  console.log('LINE User ID:', profile.userId);
  console.log('Display Name:', profile.displayName);
  console.log('Picture URL:', profile.pictureUrl);
  console.log('========================================');

  // Copy to clipboard
  navigator.clipboard.writeText(profile.userId);
  alert('LINE User ID copied to clipboard!');
});
```

### วิธีที่ 2: ผ่าน Backend Logs

ถ้า Backend มี logging เมื่อ Staff พยายาม login:
```
❌ Failed login attempt - LINE User ID: U1234567890abcdef
```

### วิธีที่ 3: ผ่าน LINE Developers Console

1. ไปที่ https://developers.line.biz/console/
2. เลือก Provider → Channel
3. ไปที่ User ID Management
4. ค้นหาจาก Display Name

---

## 📋 ตัวอย่างการใช้งานจริง

### Scenario 1: Staff ใหม่ต้องการ login

**ปัญหา:** Staff login ผ่าน LINE แล้วได้ 401 Unauthorized

**วิธีแก้:**

```sql
-- 1. เช็คว่ามี Staff record หรือไม่
SELECT * FROM staffs WHERE email = 'john@isuzu.com';

-- 2. ถ้ามี → หา LINE User ID จาก Staff
--    (ให้ Staff เปิด LIFF → F12 → Console → run script ด้านบน)

-- 3. เชื่อมโยง
UPDATE staffs
SET
  line_user_id = 'U1234567890abcdef',
  line_display_name = 'John Doe',
  line_last_login_at = NOW(),
  is_line_linked = 1
WHERE email = 'john@isuzu.com';

-- 4. ยืนยัน
SELECT staff_code, first_name, last_name, line_user_id, is_line_linked
FROM staffs
WHERE email = 'john@isuzu.com';
```

### Scenario 2: เชื่อมโยงผิด ต้องการแก้ไข

```sql
-- ยกเลิกการเชื่อมโยงเดิม
UPDATE staffs
SET line_user_id = NULL, is_line_linked = 0
WHERE staff_code = 'STAFF001';

-- เชื่อมโยงใหม่
UPDATE staffs
SET
  line_user_id = 'U_NEW_CORRECT_ID',
  line_display_name = 'John Doe',
  line_last_login_at = NOW(),
  is_line_linked = 1
WHERE staff_code = 'STAFF001';
```

### Scenario 3: ดูว่าใครยังไม่เชื่อมโยง

```sql
-- Staff ที่ยังไม่เชื่อมโยง LINE
SELECT
  staff_code,
  CONCAT(first_name, ' ', last_name) AS full_name,
  email,
  phone,
  '❌ Not Linked' AS status
FROM staffs
WHERE line_user_id IS NULL OR is_line_linked = 0
ORDER BY department, staff_code;
```

---

## 🛠️ Troubleshooting

### Error: "Duplicate entry for key 'line_user_id'"

**สาเหตุ:** LINE User ID นี้ถูกเชื่อมโยงกับ Staff อื่นแล้ว

**วิธีแก้:**
```sql
-- หาว่าเชื่อมโยงกับใคร
SELECT staff_code, first_name, last_name, line_user_id
FROM staffs
WHERE line_user_id = 'U1234567890abcdef';

-- ถ้าต้องการย้าย → ยกเลิกของเก่าก่อน
UPDATE staffs
SET line_user_id = NULL, is_line_linked = 0
WHERE line_user_id = 'U1234567890abcdef';
```

### Error: "ROW_COUNT = 0" (ไม่มี row ถูก update)

**สาเหตุ:**
- Staff Code ไม่มีในระบบ
- Staff status ไม่ใช่ 'active'

**วิธีแก้:**
```sql
-- เช็คว่ามี Staff หรือไม่
SELECT * FROM staffs WHERE staff_code = 'STAFF001';

-- เช็ค status
SELECT staff_code, status FROM staffs WHERE staff_code = 'STAFF001';

-- ถ้า status ไม่ active → แก้
UPDATE staffs SET status = 'active' WHERE staff_code = 'STAFF001';
```

### Staff login แล้วยังได้ 401

**เช็คขั้นตอน:**
```sql
-- 1. เช็คว่าเชื่อมโยงแล้วหรือไม่
SELECT line_user_id, is_line_linked FROM staffs WHERE staff_code = 'STAFF001';

-- 2. เช็คว่า LINE User ID ตรงกับที่ Staff login หรือไม่
--    (ให้ Staff run liff.getProfile() แล้วเทียบ)

-- 3. เช็คว่า status = 'active' หรือไม่
SELECT staff_code, status FROM staffs WHERE staff_code = 'STAFF001';

-- 4. Test query ที่ Backend ใช้
SELECT * FROM staffs
WHERE line_user_id = 'U1234567890abcdef'
  AND status = 'active';
```

---

## 🔐 Security Notes

- ❌ **อย่า** เปิดเผย LINE User ID สาธารณะ
- ✅ **ใช้** HTTPS เมื่อเชื่อมต่อ MySQL
- ✅ **จำกัด** permissions ของ MySQL user
- ✅ **Log** การเปลี่ยนแปลงข้อมูล Staff
- ✅ **Backup** database ก่อนทำการแก้ไขครั้งใหญ่

---

## 📞 ติดต่อ Support

หากมีปัญหาหรือข้อสงสัย:
1. เช็ค Backend logs (Railway → Backend → Logs)
2. เช็ค MySQL query logs
3. ติดต่อ DevOps team

---

## 📚 เอกสารเพิ่มเติม

- [LINE Registration Guide](../../docs/LINE_REGISTRATION_GUIDE.md)
- [Backend API Documentation](../../docs/API.md)
- [Database Schema](../../docs/DATABASE.md)

---

**สร้างโดย:** ISUZU Stock Management System
**วันที่อัปเดต:** 2025-01-06
**Version:** 1.0.0
