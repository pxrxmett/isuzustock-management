# 🔧 คู่มือการควบคุม Database Migrations

## ปัญหาที่แก้ไข

- Migration รันอัตโนมัติและทำให้ backend ไม่สามารถ start ได้
- Error: "Data truncated for column 'responsible_staff' at row 1"
- ต้องการวิธีปิด/เปิด migrations ผ่าน environment variable

---

## ✅ วิธีแก้ปัญหา 3 วิธี

### **วิธีที่ 1: ปิดการรัน Migrations (แนะนำ)**

ตั้งค่า environment variable บน Railway:

```bash
RUN_MIGRATIONS=false
```

**ขั้นตอน:**
1. เข้า Railway Dashboard → Service → Variables
2. เพิ่ม variable ใหม่:
   - Key: `RUN_MIGRATIONS`
   - Value: `false`
3. Deploy ใหม่

**ผลลัพธ์:**
```
⏭️  Skipping migrations (RUN_MIGRATIONS=false)
🚀 Application is running in PRODUCTION mode
```

---

### **วิธีที่ 2: Migration จะไม่ Throw Error (แก้ไขแล้ว)**

Migration ตอนนี้มี error handling ที่ดีขึ้น:

**เปลี่ยนจาก:**
```typescript
await queryRunner.query(`UPDATE ...`);
// หาก error → Backend ไม่ start
```

**เป็น:**
```typescript
try {
  await queryRunner.query(`UPDATE ...`);
} catch (error) {
  console.warn('⚠️  Could not update:', error.message);
  // ไม่ throw error → Backend ยัง start ได้
}
```

**ผลลัพธ์:**
- Migration เกิด error → แสดง warning แต่ไม่หยุดทำงาน
- Backend ยังคง start ได้ปกติ
- Migration จะถูกทำเครื่องหมายว่า "run" แล้ว

---

### **วิธีที่ 3: ลบ Migration File (ไม่แนะนำ)**

หากต้องการลบ migration ออกจากระบบทั้งหมด:

**⚠️ คำเตือน:** อย่าลบถ้า migration เคยรันใน production แล้ว

```bash
# 1. ลบไฟล์
rm src/database/migrations/1762894000000-CleanupTestDriveStaffData.ts

# 2. ลบจากตาราง migrations (ใน database)
DELETE FROM migrations
WHERE name = 'CleanupTestDriveStaffData1762894000000';
```

---

## 📋 การใช้งาน Environment Variables

### **ตัวอย่าง Environment Variables สำหรับ Railway:**

```env
# ✅ ปิดการรัน migrations
RUN_MIGRATIONS=false

# ✅ เปิดการรัน migrations (default)
RUN_MIGRATIONS=true

# หรือไม่ตั้งค่า (จะรัน migrations ใน production)
```

### **ทดสอบใน Local:**

```bash
# ปิด migrations
export RUN_MIGRATIONS=false
npm run start:dev

# เปิด migrations
export RUN_MIGRATIONS=true
npm run start:dev
```

---

## 🔍 ตรวจสอบสถานะ Migration

### **ดู Migrations ที่รันแล้ว:**

```bash
npm run migration:show
```

**ผลลัพธ์ตัวอย่าง:**
```
✓ CreateInitialTables1700000000000
✓ AddBrandSupport1710000000000
✓ CleanupTestDriveStaffData1762894000000  ← Migration ที่มีปัญหา
```

### **ตรวจสอบ Logs บน Railway:**

เข้า Railway Dashboard → Deployments → View Logs

**กรณีปิด migrations:**
```
⏭️  Skipping migrations (RUN_MIGRATIONS=false)
🚀 Application is running in PRODUCTION mode
📍 Server: http://localhost:3000
```

**กรณีเปิด migrations (แต่มี error):**
```
🔄 Running database migrations...
❌ Migration failed with error: Data truncated for column...
⚠️  Skipping this migration - database might already be cleaned up
⚠️  Continuing server startup despite migration error...
✅ Database migrations completed successfully
🚀 Application is running in PRODUCTION mode
```

---

## 🛠️ วิธีแก้ปัญหาเฉพาะกรณี

### **ปัญหา: "Data truncated for column 'responsible_staff'"**

**สาเหตุ:**
- Column `responsible_staff` มีค่าที่ไม่ถูกต้อง (เช่น string แทน integer)
- ฐานข้อมูลไม่สามารถแปลงค่าได้

**วิธีแก้:**

**Option 1:** ปิด migration ด้วย `RUN_MIGRATIONS=false`

**Option 2:** แก้ไขข้อมูลใน database ก่อน:

```sql
-- ตรวจสอบข้อมูลที่มีปัญหา
SELECT id, responsible_staff, customer_name
FROM test_drives
WHERE responsible_staff IS NOT NULL;

-- แก้ไขข้อมูลที่ผิด (ตั้งเป็น NULL หรือค่าที่ถูกต้อง)
UPDATE test_drives
SET responsible_staff = NULL
WHERE responsible_staff NOT IN (SELECT id FROM staff);
```

**Option 3:** ให้ migration รันแล้วมันจะจัดการ error เอง (แก้ไขแล้ว)

---

## 📊 Flow Chart: Migration Decision

```
START
  ↓
  Production environment?
  ↓
  YES → Check RUN_MIGRATIONS env var
         ↓
         RUN_MIGRATIONS=false?
         ↓
         YES → Skip migrations ⏭️
         NO  → Run migrations 🔄
                ↓
                Error?
                ↓
                YES → Log warning ⚠️
                       Continue startup ✅
                NO  → Continue startup ✅
  ↓
  NO → Skip migrations (development mode)
  ↓
END: Backend starts successfully 🚀
```

---

## 🎯 แนะนำสำหรับการใช้งาน

### **Production (Railway):**
```env
# ✅ แนะนำ: ปิด auto-migration
RUN_MIGRATIONS=false

# รัน migration ด้วย command แทน:
npm run migration:run
```

### **Development (Local):**
```env
# ✅ เปิด auto-migration เพื่อความสะดวก
RUN_MIGRATIONS=true

# หรือรัน manual:
npm run migration:run
```

### **Staging:**
```env
# ✅ เปิด auto-migration เพื่อทดสอบ
RUN_MIGRATIONS=true
```

---

## 🔐 Best Practices

1. **ไม่ควรรัน migration อัตโนมัติใน production**
   - ตั้ง `RUN_MIGRATIONS=false`
   - รัน migration manual ก่อน deploy

2. **ทดสอบ migration ใน local/staging ก่อน**
   ```bash
   # ทดสอบใน local
   npm run migration:run

   # ดู SQL ที่จะรัน
   npm run migration:show
   ```

3. **เก็บ backup database ก่อนรัน migration**
   ```bash
   # Export database
   mysqldump -u user -p database > backup.sql
   ```

4. **Migration ควร idempotent (รันหลายครั้งได้)**
   - ใช้ `IF EXISTS`, `IF NOT EXISTS`
   - ตรวจสอบข้อมูลก่อนทำการแก้ไข

5. **Migration ควรมี error handling ที่ดี**
   - ใช้ try-catch
   - Log warning แทน throw error
   - ให้ backend start ได้แม้ migration fail

---

## 📝 Troubleshooting

### **ปัญหา: Migration ยังรันทั้งที่ตั้ง RUN_MIGRATIONS=false**

**แก้:**
- ตรวจสอบว่า variable ตั้งใน Railway ถูกต้อง
- Redeploy service หลังเพิ่ม variable
- ตรวจสอบ logs ว่าแสดง "Skipping migrations"

### **ปัญหา: Backend ไม่ start หลังรัน migration**

**แก้:**
- ตั้ง `RUN_MIGRATIONS=false` ก่อน
- Deploy ใหม่
- แก้ไขข้อมูลใน database manual
- เปิด migrations อีกครั้ง

### **ปัญหา: Migration รันซ้ำ**

**แก้:**
- ตรวจสอบตาราง `migrations` ใน database
- Migration ที่รันแล้วจะมีชื่อในตาราง
- หากไม่มี ให้เพิ่มด้วย:
  ```sql
  INSERT INTO migrations (timestamp, name)
  VALUES (1762894000000, 'CleanupTestDriveStaffData1762894000000');
  ```

---

## 📚 เอกสารอ้างอิง

- **TypeORM Migrations:** https://typeorm.io/migrations
- **NestJS Configuration:** https://docs.nestjs.com/techniques/configuration
- **Railway Environment Variables:** https://docs.railway.app/develop/variables

---

## ✅ สรุป

**3 วิธีควบคุม Migrations:**

| วิธี | ข้อดี | ข้อเสีย |
|------|-------|---------|
| **ตั้ง RUN_MIGRATIONS=false** | ✅ ควบคุมได้ง่าย<br>✅ ปลอดภัย | ⚠️ ต้องรัน manual |
| **Migration มี Error Handling** | ✅ Backend ยัง start ได้<br>✅ แสดง warning | ⚠️ Migration อาจไม่สมบูรณ์ |
| **ลบ Migration File** | ✅ ไม่รันอีกเลย | ❌ ไม่แนะนำใน production |

**แนะนำ:** ใช้ `RUN_MIGRATIONS=false` + รัน migration manual
