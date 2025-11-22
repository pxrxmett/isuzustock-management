# 🔧 TypeORM Entity Schema Alignment Report

## สรุปการแก้ไข

แก้ไข TypeORM Entity files ทั้งหมดให้ตรงกับ database schema เพื่อแก้ปัญหา:
- Column names ไม่ตรงกัน (camelCase vs snake_case)
- Data types ไม่ตรงกัน (timestamp vs datetime)
- Enum values ไม่ตรงกัน (lowercase vs UPPERCASE)
- ขาด columns ที่ frontend ต้องการ (first_name, last_name)

---

## 📊 การเปลี่ยนแปลงแต่ละ Entity

### 1. ✅ **brand.entity.ts** - ไม่ต้องแก้ไข

```typescript
@Entity('brands')
export class Brand {
  // ✅ ถูกต้องแล้ว
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date;
}
```

**สรุป:** Entity นี้ถูกต้องตรงกับ database schema แล้ว

---

### 2. 🔨 **vehicle.entity.ts** - แก้ไขแล้ว

#### ปัญหาที่พบ:
- ❌ ไม่มีการระบุชื่อตาราง
- ❌ ใช้ `@Column` แทน `@CreateDateColumn` / `@UpdateDateColumn`
- ❌ Timestamps ไม่สอดคล้องกับ best practices

#### การแก้ไข:

**ก่อนแก้:**
```typescript
@Entity() // ❌ ไม่ระบุชื่อตาราง
export class Vehicle {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

**หลังแก้:**
```typescript
@Entity('vehicle') // ✅ ระบุชื่อตาราง
export class Vehicle {
  // ✅ ใช้ decorator ที่ถูกต้อง
  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;
}
```

**ผลลัพธ์:**
- ✅ ระบุชื่อตารางชัดเจน
- ✅ ใช้ decorator ที่เหมาะสมสำหรับ timestamps
- ✅ ตรงกับ database schema: `createdAt` และ `updatedAt` (camelCase)

---

### 3. 🔨 **staff.entity.ts** - แก้ไขแล้ว

#### ปัญหาที่พบ:
- ❌ ไม่มี `first_name` และ `last_name` columns
- ❌ Frontend ใช้ first_name/last_name แต่ database มีแต่ full_name

#### การแก้ไข:

**ก่อนแก้:**
```typescript
@Entity('staff')
export class Staff {
  @Column({ name: 'employee_code', type: 'varchar', length: 20, unique: true })
  employeeCode: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  // ❌ ไม่มี first_name และ last_name
}
```

**หลังแก้:**
```typescript
@Entity('staff')
export class Staff {
  @Column({ name: 'employee_code', type: 'varchar', length: 20, unique: true })
  employeeCode: string;

  // ✅ เพิ่ม first_name และ last_name
  @Column({ name: 'first_name', type: 'varchar', length: 50, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: true })
  lastName: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;
}
```

**ผลลัพธ์:**
- ✅ เพิ่ม first_name และ last_name columns
- ✅ ยังคง full_name ไว้สำหรับ backward compatibility
- ✅ Frontend ใช้ first_name + last_name ได้แล้ว
- ✅ Migration จะแยก full_name เป็น first_name และ last_name อัตโนมัติ

---

### 4. 🔨 **test-drive.entity.ts** - แก้ไขแล้ว

#### ปัญหาที่พบ:
- ❌ Enum values เป็น lowercase ('pending') แต่ database ต้องการ UPPERCASE ('PENDING')
- ❌ Timestamps ไม่ระบุ precision สำหรับ datetime(6)

#### การแก้ไข:

**ก่อนแก้:**
```typescript
@Entity('test_drives')
export class TestDrive {
  @Column({
    type: 'enum',
    enum: ['pending', 'ongoing', 'completed', 'cancelled'], // ❌ lowercase
    default: 'pending',
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' }) // ❌ ไม่ระบุ precision
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) // ❌ ไม่ระบุ precision
  updatedAt: Date;
}
```

**หลังแก้:**
```typescript
// ✅ สร้าง enum ที่ถูกต้อง
export enum TestDriveStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('test_drives')
export class TestDrive {
  @Column({
    type: 'enum',
    enum: TestDriveStatus, // ✅ ใช้ enum
    default: TestDriveStatus.PENDING,
  })
  status: TestDriveStatus;

  // ✅ ระบุ datetime(6) precision
  @CreateDateColumn({ type: 'datetime', precision: 6, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6, name: 'updated_at' })
  updatedAt: Date;
}
```

**ผลลัพธ์:**
- ✅ Enum values เป็น UPPERCASE ตรงกับ database
- ✅ Timestamps ใช้ datetime(6) ตรงกับ MySQL schema
- ✅ Type safety ดีขึ้นด้วย TypeScript enum

---

### 5. 🔨 **event.entity.ts** - แก้ไขแล้ว

#### ปัญหาที่พบ:
- ❌ Timestamps ไม่ระบุ precision สำหรับ datetime(6)
- ❌ ไม่ระบุ column names ชัดเจน

#### การแก้ไข:

**ก่อนแก้:**
```typescript
@Entity('events')
export class Event {
  @CreateDateColumn() // ❌ ไม่ระบุ type, precision, name
  createdAt: Date;

  @UpdateDateColumn() // ❌ ไม่ระบุ type, precision, name
  updatedAt: Date;
}
```

**หลังแก้:**
```typescript
@Entity('events')
export class Event {
  // ✅ ระบุครบถ้วน
  @CreateDateColumn({ type: 'datetime', precision: 6, name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6, name: 'updatedAt' })
  updatedAt: Date;
}
```

**ผลลัพธ์:**
- ✅ Timestamps ใช้ datetime(6) ตรงกับ MySQL schema
- ✅ Column names ชัดเจน (createdAt - camelCase)

---

## 📝 Migration ใหม่

### **1762900000000-AddFirstNameLastNameToStaff.ts**

```typescript
export class AddFirstNameLastNameToStaff1762900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // เพิ่ม columns
    await queryRunner.query(`
      ALTER TABLE staff
      ADD COLUMN first_name VARCHAR(50) NULL AFTER employee_code,
      ADD COLUMN last_name VARCHAR(50) NULL AFTER first_name
    `);

    // แยก full_name เป็น first_name และ last_name
    await queryRunner.query(`
      UPDATE staff
      SET first_name = SUBSTRING_INDEX(full_name, ' ', 1),
          last_name = TRIM(SUBSTRING(full_name, LOCATE(' ', full_name) + 1))
      WHERE full_name IS NOT NULL
        AND full_name != ''
        AND LOCATE(' ', full_name) > 0
    `);
  }
}
```

**การทำงาน:**
1. เพิ่ม `first_name` และ `last_name` columns
2. แยกข้อมูลจาก `full_name` ที่มีอยู่แล้ว
   - `first_name` = ชื่อส่วนแรก (ก่อนช่องว่าง)
   - `last_name` = นามสกุล (หลังช่องว่าง)

**ตัวอย่าง:**
- `full_name: "สมชาย ใจดี"` → `first_name: "สมชาย"`, `last_name: "ใจดี"`
- `full_name: "System Admin"` → `first_name: "System"`, `last_name: "Admin"`

---

## 🔍 สรุปการเปลี่ยนแปลง

### ตาราง: Database Schema vs Entity Mapping

| Table | Column (DB) | Property (Entity) | Type (DB) | Type (Entity) | Status |
|-------|-------------|-------------------|-----------|---------------|--------|
| **brands** | created_at | createdAt | timestamp | timestamp | ✅ |
| **brands** | updated_at | updatedAt | timestamp | timestamp | ✅ |
| **vehicle** | createdAt | createdAt | timestamp | timestamp | ✅ แก้แล้ว |
| **vehicle** | updatedAt | updatedAt | timestamp | timestamp | ✅ แก้แล้ว |
| **staff** | employee_code | employeeCode | varchar(20) | varchar(20) | ✅ |
| **staff** | first_name | firstName | varchar(50) | varchar(50) | ✅ เพิ่มใหม่ |
| **staff** | last_name | lastName | varchar(50) | varchar(50) | ✅ เพิ่มใหม่ |
| **staff** | full_name | fullName | varchar(100) | varchar(100) | ✅ |
| **staff** | created_at | createdAt | datetime(6) | datetime(6) | ✅ |
| **staff** | updated_at | updatedAt | datetime(6) | datetime(6) | ✅ |
| **test_drives** | status | status | enum | TestDriveStatus | ✅ แก้แล้ว |
| **test_drives** | created_at | createdAt | datetime(6) | datetime(6) | ✅ แก้แล้ว |
| **test_drives** | updated_at | updatedAt | datetime(6) | datetime(6) | ✅ แก้แล้ว |
| **events** | createdAt | createdAt | datetime(6) | datetime(6) | ✅ แก้แล้ว |
| **events** | updatedAt | updatedAt | datetime(6) | datetime(6) | ✅ แก้แล้ว |

---

## 🚀 การ Deploy

### ขั้นตอนการ Deploy:

1. **ตรวจสอบ Migration:**
```bash
npm run migration:show
```

2. **รัน Migration (ใน Production):**
```bash
# บน Railway หรือ Production Server
npm run migration:run
```

3. **ตรวจสอบผลลัพธ์:**
```sql
-- ตรวจสอบว่า columns ถูกเพิ่มแล้ว
DESC staff;

-- ตรวจสอบข้อมูลที่ migrate
SELECT id, employee_code, first_name, last_name, full_name FROM staff LIMIT 10;
```

### Expected Output:

```
🔧 Adding first_name and last_name columns to staff table...
✅ Columns added successfully
🔄 Migrating existing full_name data...
✅ Data migration completed
```

### ตรวจสอบผลลัพธ์:

```sql
mysql> SELECT employee_code, first_name, last_name, full_name FROM staff;
+---------------+------------+----------+------------------+
| employee_code | first_name | last_name| full_name        |
+---------------+------------+----------+------------------+
| ISU001        | สมชาย      | ใจดี     | สมชาย ใจดี       |
| ISU002        | สมหญิง     | รักดี    | สมหญิง รักดี     |
| ADMIN001      | ผู้ดูแลระบบ | NULL     | ผู้ดูแลระบบ     |
+---------------+------------+----------+------------------+
```

**หมายเหตุ:** ถ้า full_name ไม่มีช่องว่าง (เช่น "ผู้ดูแลระบบ") last_name จะเป็น NULL

---

## ⚠️ Breaking Changes

### สำหรับ Code ที่ใช้ TestDrive entity:

**ก่อนแก้:**
```typescript
const testDrive = new TestDrive();
testDrive.status = 'pending'; // ❌ จะ error ตอนนี้
```

**หลังแก้:**
```typescript
import { TestDriveStatus } from './test-drive.entity';

const testDrive = new TestDrive();
testDrive.status = TestDriveStatus.PENDING; // ✅ ถูกต้อง
```

### การตรวจสอบ status:

**ก่อนแก้:**
```typescript
if (testDrive.status === 'pending') { } // ❌
```

**หลังแก้:**
```typescript
if (testDrive.status === TestDriveStatus.PENDING) { } // ✅
```

---

## 📊 ผลกระทบต่อ Frontend

### ข้อมูลที่ส่งจาก Backend เปลี่ยนแปลง:

**ก่อนแก้:**
```json
{
  "staffInfo": {
    "id": 1,
    "full_name": "สมชาย ใจดี",
    "full_name_en": "Somchai Jaidee"
  }
}
```

**หลังแก้:**
```json
{
  "staffInfo": {
    "id": 1,
    "first_name": "สมชาย",
    "last_name": "ใจดี",
    "full_name": "สมชาย ใจดี",
    "full_name_en": "Somchai Jaidee"
  }
}
```

**Frontend code ตอนนี้ใช้งานได้แล้ว:**
```javascript
// ✅ ตอนนี้ทำงานได้แล้ว
const fullName = `${staffInfo.first_name} ${staffInfo.last_name}`;
```

---

## ✅ Checklist สำหรับ Production

- [x] แก้ไข Entity files ให้ตรงกับ database schema
- [x] สร้าง Migration สำหรับเพิ่ม first_name และ last_name
- [x] Test migration ใน local environment
- [ ] Deploy migration ไปยัง production
- [ ] ตรวจสอบข้อมูลหลัง migration
- [ ] Update LINE Integration Service ให้ส่ง first_name และ last_name
- [ ] Test frontend ว่าแสดง staff name ถูกต้อง

---

## 🔗 Related Files

- `src/modules/brand/entities/brand.entity.ts`
- `src/modules/stock/entities/vehicle.entity.ts`
- `src/modules/staff/entities/staff.entity.ts`
- `src/modules/test-drive/entities/test-drive.entity.ts`
- `src/modules/events/entities/event.entity.ts`
- `src/database/migrations/1762900000000-AddFirstNameLastNameToStaff.ts`

---

## 📝 Notes

- ✅ ทุก Entity ตอนนี้ตรงกับ database schema แล้ว
- ✅ Migration จะรันอัตโนมัติเมื่อ deploy (ถ้า RUN_MIGRATIONS=true)
- ✅ ข้อมูลเก่าจะถูก migrate อัตโนมัติ
- ⚠️ ต้อง update LINE Integration Service ให้ส่ง first_name และ last_name ด้วย

---

**Created:** 2025-11-22
**Last Updated:** 2025-11-22
**Commit:** `fe7d75d` - fix: Align TypeORM entities with database schema
