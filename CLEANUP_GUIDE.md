# 🔧 Guide: Fix FK Constraint Error for test_drives

## ปัญหา

TypeORM ไม่สามารถสร้าง Foreign Key constraint ได้เนื่องจาก:
```
Cannot add or update a child row: a foreign key constraint fails
(`stock_management`.`test_drives`, CONSTRAINT `FK_xxx`
FOREIGN KEY (`responsible_staff`) REFERENCES `staff` (`id`))
```

**สาเหตุ:** มีข้อมูลใน `test_drives` ที่อ้างอิง `staff.id` ที่ไม่มีอยู่จริงในตาราง `staff`

---

## 🎯 แก้ไขอย่างไร

### วิธีที่ 1: ใช้ Shell Script (แนะนำ)

```bash
# รันจาก root directory ของโปรเจค
./scripts/run-cleanup.sh
```

Script จะ:
- ✅ ตรวจสอบข้อมูลที่มีปัญหา
- ✅ แสดงรายการที่จะแก้ไข
- ✅ ขอยืนยันก่อนทำการแก้ไข
- ✅ แก้ไขข้อมูลโดยตั้งค่า invalid references เป็น `NULL`
- ✅ แสดงผลลัพธ์หลังแก้ไข

---

### วิธีที่ 2: รัน SQL โดยตรง

```bash
# เชื่อมต่อ MySQL
mysql -u your_username -p your_database

# รัน SQL script
source scripts/cleanup-test-drives-staff.sql
```

---

### วิธีที่ 3: ตรวจสอบและแก้ไขด้วยตนเอง

#### 1. ตรวจสอบข้อมูลที่มีปัญหา

```sql
-- ดู test_drives ที่มี responsible_staff ไม่ถูกต้อง
SELECT td.id, td.responsible_staff, td.customer_name
FROM test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
WHERE td.responsible_staff IS NOT NULL
  AND s.id IS NULL;
```

#### 2. แก้ไขข้อมูล

```sql
-- ตั้งค่า invalid references เป็น NULL
UPDATE test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
SET td.responsible_staff = NULL
WHERE td.responsible_staff IS NOT NULL
  AND s.id IS NULL;
```

#### 3. ตรวจสอบอีกครั้ง

```sql
-- ต้องได้ 0 rows
SELECT COUNT(*) as invalid_count
FROM test_drives td
LEFT JOIN staff s ON td.responsible_staff = s.id
WHERE td.responsible_staff IS NOT NULL
  AND s.id IS NULL;
```

---

## 📋 ขั้นตอนหลังแก้ไข

1. **Verify ว่าแก้ไขเสร็จแล้ว**
   ```bash
   # ผลลัพธ์ต้องได้ 0 สำหรับทุก column
   mysql> SELECT COUNT(*) FROM test_drives td
          LEFT JOIN staff s ON td.responsible_staff = s.id
          WHERE td.responsible_staff IS NOT NULL AND s.id IS NULL;
   ```

2. **Build โปรเจค**
   ```bash
   npm run build
   ```

3. **รัน Migration (ถ้าจำเป็น)**
   ```bash
   npm run migration:run
   ```

4. **Start Application**
   ```bash
   npm run start:dev
   # หรือ
   npm start
   ```

---

## ⚠️ หมายเหตุสำคัญ

### ข้อมูลที่จะถูกแก้ไข

- `test_drives.responsible_staff` → `NULL` (ถ้าอ้างอิง staff.id ที่ไม่มีอยู่)
- `test_drives.assigned_staff_id` → `NULL` (ถ้าอ้างอิง staff.id ที่ไม่มีอยู่)
- `test_drives.created_by_staff_id` → `NULL` (ถ้าอ้างอิง staff.id ที่ไม่มีอยู่)

### ผลกระทบ

- ข้อมูล test drive ยังคงอยู่ แค่ข้อมูล staff reference จะเป็น `NULL`
- FK constraints จะถูกสร้างได้สำเร็จ
- Application จะสามารถ start ได้ปกติ

### Backup

แนะนำให้ **backup database ก่อน** รัน cleanup:
```bash
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🔍 การทดสอบ

หลังจากแก้ไขแล้ว ทดสอบว่า application start ได้:

```bash
npm run build
npm run start:dev
```

ถ้าเห็น:
```
[Nest] xxx - Application successfully started
```

แสดงว่าแก้ไขสำเร็จ! ✅

---

## 📞 ต้องการความช่วยเหลือ?

ถ้ามีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ logs ใน console
2. ตรวจสอบว่า cleanup script รันสำเร็จหรือไม่
3. ตรวจสอบว่ายังมีข้อมูล invalid อยู่หรือไม่ (ใช้ SQL query ด้านบน)
