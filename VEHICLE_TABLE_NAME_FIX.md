# 🔧 Vehicle Table Name Fix - QueryFailedError Resolution

## 🚨 ปัญหาที่เกิดขึ้น

```
QueryFailedError: Unknown column 'vehicle.brand_id' in 'field list'

SELECT ... `vehicle`.`brand_id` AS `vehicle_brand_id` ...
FROM `test_drives` `td`
LEFT JOIN `vehicle` `vehicle` ON `vehicle`.`id`=`td`.`vehicle_id`
WHERE `td`.`brand_id` = 1
```

**อาการ:**
- Backend crash เมื่อ query test_drives with vehicle join
- Error บอกว่า column `vehicle.brand_id` ไม่มีอยู่
- แต่เช็ค database แล้วมี column อยู่ (หรือคิดว่ามี?)

---

## 🔍 Root Cause Analysis

### สาเหตุหลัก: **Table Name Mismatch**

**Timeline:**

1. **Migration เก่า (ถูกต้อง):**
   ```typescript
   // 1745828200000-AddEventFieldsToVehicles.ts
   await queryRunner.query(`ALTER TABLE vehicle ...`);  // ✅ ชื่อตารางจริง
   ```

2. **Migration ใหม่ (ผิด!):**
   ```typescript
   // 1762872964062-AddBrandIdToVehicles.ts
   await queryRunner.addColumn(
     'vehicles',  // ❌ ผิด! ตารางนี้ไม่มีอยู่จริง
     new TableColumn({ name: 'brand_id', ... })
   );
   ```

3. **Entity (ตามการแก้ไขล่าสุด - ผิดเช่นกัน):**
   ```typescript
   @Entity('vehicles')  // ❌ ผิด! ตารางจริงไม่มี 's'
   export class Vehicle {
   ```

**ผลลัพธ์:**
- Database มีตารางชื่อ `vehicle` (ไม่มี s)
- Migration พยายามเพิ่ม brand_id ให้ตาราง `vehicles` (ที่ไม่มีอยู่จริง)
- **Column brand_id ไม่ได้ถูกเพิ่มเข้าไปจริงๆ!**
- TypeORM query หา `vehicle.brand_id` → Error!

---

## ✅ การแก้ไข

### 1. แก้ไข Entity Definition

**Before:**
```typescript
@Entity('vehicles')  // ❌ ผิด
export class Vehicle {
```

**After:**
```typescript
@Entity('vehicle')  // ✅ ถูกต้อง - ตรงกับตารางจริง
export class Vehicle {
```

### 2. แก้ไข Migration

**Before:**
```typescript
await queryRunner.addColumn(
  'vehicles',  // ❌ ผิด
  new TableColumn({ name: 'brand_id', ... })
);

await queryRunner.createIndex('vehicles', ...);  // ❌ ผิด
await queryRunner.createForeignKey('vehicles', ...);  // ❌ ผิด
```

**After:**
```typescript
await queryRunner.addColumn(
  'vehicle',  // ✅ ถูกต้อง
  new TableColumn({ name: 'brand_id', ... })
);

await queryRunner.createIndex('vehicle', ...);  // ✅ ถูกต้อง
await queryRunner.createForeignKey('vehicle', ...);  // ✅ ถูกต้อง
```

---

## 🚀 ขั้นตอนการ Deploy

### สำหรับ Production (Railway):

#### Step 1: ตรวจสอบว่า migration เคยรันหรือไม่

```bash
# เข้า Railway MySQL Console
mysql> SELECT * FROM migrations WHERE name LIKE '%AddBrandIdToVehicles%';
```

**ถ้ามี record:**
```
+----+------------------------------------------+
| id | name                                     |
+----+------------------------------------------+
|  X | AddBrandIdToVehicles1762872964062       |
+----+------------------------------------------+
```

ต้องลบออกเพื่อให้รันใหม่:
```sql
DELETE FROM migrations
WHERE name = 'AddBrandIdToVehicles1762872964062';
```

#### Step 2: ตรวจสอบว่า column brand_id มีอยู่หรือไม่

```sql
mysql> SHOW COLUMNS FROM vehicle LIKE 'brand_id';
```

**ถ้าไม่มี:** ข้ามไป Step 3
**ถ้ามีอยู่แล้ว:** ข้ามไป Step 4 (migration รันสำเร็จแล้ว)

#### Step 3: Push code และรัน migration

```bash
# Push code ที่แก้ไขแล้ว
git push origin <branch-name>

# Railway จะ auto-deploy และรัน migration
# หรือรัน manual:
npm run migration:run
```

#### Step 4: ตรวจสอบผลลัพธ์

```sql
-- ตรวจสอบ column ถูกเพิ่มแล้ว
mysql> SHOW COLUMNS FROM vehicle LIKE 'brand%';
+----------+------+------+-----+---------+
| Field    | Type | Null | Key | Default |
+----------+------+------+-----+---------+
| brand_id | int  | NO   | MUL | 1       |
+----------+------+------+-----+---------+

-- ตรวจสอบ indexes
mysql> SHOW INDEX FROM vehicle WHERE Column_name = 'brand_id';

-- ตรวจสอบ foreign key
mysql> SELECT CONSTRAINT_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_NAME = 'vehicle'
         AND COLUMN_NAME = 'brand_id';
```

**Expected:**
- ✅ Column `brand_id` มีอยู่ใน table `vehicle`
- ✅ Index `IDX_VEHICLE_BRAND_ID` มีอยู่
- ✅ Index `IDX_VEHICLE_BRAND_STATUS` มีอยู่
- ✅ Foreign Key `FK_VEHICLE_BRAND` มีอยู่

#### Step 5: ทดสอบ API

```bash
# Test vehicle query with brand filter
curl https://your-api.railway.app/api/vehicle?brandId=1

# Test test-drive query (with vehicle join)
curl https://your-api.railway.app/api/test-drives
```

**Expected:**
- ✅ ไม่มี QueryFailedError
- ✅ Response มี vehicle.brandId
- ✅ JOIN กับ test_drives ทำงานได้

---

## 🔍 วิธีตรวจสอบว่ามีปัญหาเดียวกันหรือไม่

### ตรวจสอบชื่อตารางในระบบ:

```bash
# ใน migration files
grep -r "CREATE TABLE\|ALTER TABLE\|addColumn\|createIndex" src/database/migrations/ \
  | grep -i vehicle \
  | grep -oP "(vehicles?)" \
  | sort | uniq -c
```

**ถ้าเจอทั้ง `vehicle` และ `vehicles`:** มีปัญหา inconsistency

### ตรวจสอบใน database จริง:

```sql
mysql> SHOW TABLES LIKE '%vehicle%';
+---------------------------+
| Tables_in_db              |
+---------------------------+
| vehicle                   |  ← ถ้ามีแค่อันนี้ = ถูกต้อง
| event_vehicles            |
+---------------------------+

-- ถ้ามี 'vehicles' (มี s) ด้วย → มีปัญหา ตารางซ้ำ!
```

---

## 📋 Checklist สำหรับ Production

**Before Deploy:**
- [x] แก้ Entity: `@Entity('vehicle')`
- [x] แก้ Migration: ใช้ `'vehicle'` ทุกที่
- [x] Commit และ push code
- [ ] ลบ migration record จาก database (ถ้ามี)
- [ ] ตรวจสอบว่าไม่มี column brand_id อยู่แล้ว

**After Deploy:**
- [ ] Migration รันสำเร็จ
- [ ] Column brand_id ถูกเพิ่มเข้าไป
- [ ] Indexes ถูกสร้างแล้ว
- [ ] Foreign Key ถูกสร้างแล้ว
- [ ] API ทำงานได้ไม่มี error
- [ ] Test-drive queries ทำงานได้

---

## 🛡️ ป้องกันปัญหาในอนาคต

### 1. **ใช้ชื่อตารางแบบ Consistent**

เลือกอย่างใดอย่างหนึ่ง:
- **Singular:** `vehicle`, `staff`, `event` (แนะนำสำหรับ NestJS)
- **Plural:** `vehicles`, `staffs`, `events`

**แนะนำ:** ใช้ **Singular** เพราะ:
- Entity class ชื่อ `Vehicle` (singular)
- ใช้ `@Entity('vehicle')` จะสอดคล้องกับชื่อ class

### 2. **ตรวจสอบชื่อตารางก่อนสร้าง Migration**

```bash
# ก่อนสร้าง migration ใหม่ ให้เช็คว่าตารางชื่ออะไร
mysql> SHOW TABLES;

# หรือ grep จาก migration เก่า
grep -h "ALTER TABLE\|CREATE TABLE" src/database/migrations/*.ts \
  | grep -i <table-name>
```

### 3. **ใช้ TypeORM CLI สร้าง Migration**

```bash
# ให้ TypeORM generate migration จาก entity changes
npm run migration:generate -- -n AddBrandIdToVehicles

# TypeORM จะใช้ชื่อตารางจาก @Entity() โดยอัตโนมัติ
```

### 4. **Code Review Checklist**

เมื่อ review migration PR:
- ✅ ชื่อตารางตรงกับที่ใช้ใน migration อื่นหรือไม่
- ✅ ชื่อตารางตรงกับที่ใช้ใน Entity หรือไม่
- ✅ Column names ใช้ snake_case หรือ camelCase consistent
- ✅ ทดสอบ migration ใน local environment ก่อน

---

## 📊 สรุปการเปลี่ยนแปลง

### Files Changed:

1. **src/modules/stock/entities/vehicle.entity.ts**
   - `@Entity('vehicles')` → `@Entity('vehicle')`

2. **src/database/migrations/1762872964062-AddBrandIdToVehicles.ts**
   - ทุกที่ที่ใช้ `'vehicles'` → `'vehicle'`
   - `FK_VEHICLES_BRAND` → `FK_VEHICLE_BRAND`

### Database Changes (หลัง migration รันใหม่):

```sql
-- Column ที่ถูกเพิ่ม
ALTER TABLE vehicle ADD COLUMN brand_id INT NOT NULL DEFAULT 1;

-- Indexes ที่ถูกสร้าง
CREATE INDEX IDX_VEHICLE_BRAND_ID ON vehicle(brand_id);
CREATE INDEX IDX_VEHICLE_BRAND_STATUS ON vehicle(brand_id, status);

-- Foreign Key ที่ถูกสร้าง
ALTER TABLE vehicle ADD CONSTRAINT FK_VEHICLE_BRAND
  FOREIGN KEY (brand_id) REFERENCES brands(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;
```

---

## 🔗 Related Issues

- QueryFailedError: Unknown column 'vehicle.brand_id'
- Table name inconsistency between migrations
- Migration not creating columns in correct table

---

## 📞 Support

ถ้ายังมีปัญหา ให้เช็คสิ่งเหล่านี้:

1. **ตารางจริงๆ ใน database:**
   ```sql
   SHOW TABLES LIKE '%vehicle%';
   SHOW COLUMNS FROM vehicle;
   ```

2. **Migrations ที่รันแล้ว:**
   ```sql
   SELECT * FROM migrations ORDER BY id DESC LIMIT 10;
   ```

3. **TypeORM logs:**
   ```typescript
   // app.module.ts
   TypeOrmModule.forRoot({
     logging: ['query', 'error', 'warn'],  // เปิด logging
   })
   ```

---

**Created:** 2025-11-22
**Issue:** QueryFailedError: Unknown column 'vehicle.brand_id'
**Status:** ✅ Fixed
**Commits:**
- `7bfe56d` - ผิด (ใช้ vehicles)
- `4ac508b` - ถูก (กลับมาใช้ vehicle)
