# 📄 Environment Files Guide

เอกสารอธิบายไฟล์ `.env` ต่างๆ ในโปรเจค และการใช้งาน

---

## 📁 ไฟล์ทั้งหมด

| ไฟล์ | ใช้สำหรับ | Track ใน Git? | คำอธิบาย |
|------|-----------|---------------|----------|
| `.env` | Local Development | ❌ No | ไฟล์หลักสำหรับ local dev (copy จาก .env.example) |
| `.env.development` | Local Development | ✅ Yes | Template สำหรับ local MySQL |
| `.env.production` | Production Template | ✅ Yes | Template สำหรับ Railway production |
| `.env.railway` | Railway Docs | ✅ Yes | คู่มือ variables สำหรับ Railway Dashboard |
| `.env.example` | Template | ✅ Yes | Template พื้นฐานสำหรับ developers |

---

## 🚀 วิธีใช้งาน

### สำหรับ Local Development (Mac/Windows)

1. **Copy template:**
```bash
cp .env.example .env
# หรือ
cp .env.development .env
```

2. **แก้ไข `.env`:**
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=stockuser    # ← ใช้ MySQL user ของคุณ
DB_PASSWORD=stock1234    # ← ใช้ password ของคุณ
DB_DATABASE=stock_management
```

3. **รัน Backend:**
```bash
npm run start:dev
```

---

### สำหรับ Railway Production

1. **ไปที่ Railway Dashboard → Backend Service → Variables**

2. **กดปุ่ม "Raw Editor"**

3. **Copy เนื้อหาจาก `.env.railway`**

4. **แก้ค่าที่ต้องการ:**
   - `DB_PASSWORD` → คัดลอกจาก MySQL Service
   - `JWT_SECRET` → สร้างใหม่ด้วย `openssl rand -base64 64`
   - `LINE_CHANNEL_ACCESS_TOKEN` → จาก LINE Developers Console

5. **Save → Deploy**

---

## 🔐 Security Rules

### ✅ Track ใน Git (Public Templates):
- `.env.example` - ไม่มีค่าจริง
- `.env.development` - ใช้ค่า dummy/local
- `.env.production` - ใช้ placeholders
- `.env.railway` - เป็น docs เท่านั้น

### ❌ ห้าม Track ใน Git (มี Secrets):
- `.env` - มีค่าจริงของคุณ
- `.env.local` - มีค่าจริงของคุณ
- `.env.*.local` - มีค่าจริงของคุณ

---

## 📋 Environment Variables ที่จำเป็น

### 1. Database (Required)
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=stockuser
DB_PASSWORD=stock1234
DB_DATABASE=stock_management
```

### 2. JWT Authentication (Required)
```bash
JWT_SECRET=your-secret-here-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
```

### 3. LINE Integration (Required)
```bash
LINE_CHANNEL_ID=2006746784
LINE_CHANNEL_SECRET=e673f3def0fecc4eeb43aad4460381fa
LINE_CHANNEL_ACCESS_TOKEN=your-access-token
LINE_LIFF_ID=2006746784-e1y9NRqn
```

### 4. Frontend URLs (Required)
```bash
FRONTEND_URL=http://localhost:4000
ADMIN_URL=http://localhost:8080
```

### 5. Application Settings (Optional)
```bash
NODE_ENV=development
PORT=3000
```

---

## 🔧 Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**สาเหตุ:** `.env` ตั้งค่า `DB_USERNAME=root` แต่ MySQL ใช้ user อื่น

**วิธีแก้:**
```bash
# เช็คว่าใช้ user อะไร
mysql -u stockuser -pstock1234

# ถ้า login ได้ → แก้ .env
DB_USERNAME=stockuser
```

### Error: "Cannot add foreign key constraint"

**สาเหตุ:** มีข้อมูลเก่าใน database ที่ไม่ตรงกับ entity

**วิธีแก้:**
```bash
# Run fix script
mysql -u stockuser -pstock1234 stock_management < scripts/sql/quick-fix-test-drives.sql

# หรือลบ database เริ่มใหม่
mysql -u stockuser -pstock1234 -e "DROP DATABASE stock_management; CREATE DATABASE stock_management;"
```

### Error: ".env file not found"

**วิธีแก้:**
```bash
# Copy จาก template
cp .env.example .env

# หรือ
cp .env.development .env
```

---

## 🎯 Best Practices

### ✅ DO:
- ใช้ `.env.development` เป็น template สำหรับ local dev
- ใช้ `.env.railway` เป็น docs สำหรับ Railway
- เก็บ secrets ไว้ใน `.env` (local) หรือ Railway Dashboard (production)
- ใช้ strong JWT secrets (64+ characters)

### ❌ DON'T:
- Commit `.env` ที่มี real secrets
- ใช้ password เดียวกันสำหรับ dev และ production
- Share `.env` file ผ่าน chat/email
- Use weak secrets เช่น "secret123"

---

## 📝 Summary

```
.env.example        → Template พื้นฐาน (track)
.env.development    → Local MySQL template (track)
.env.production     → Production template (track)
.env.railway        → Railway docs (track)
.env                → Your actual secrets (DON'T track)
```

**สำหรับ Local Dev:**
```bash
cp .env.development .env
npm run start:dev
```

**สำหรับ Railway:**
- Copy `.env.railway` → Railway Variables → Deploy

---

**ถ้ามีคำถาม:** อ่าน docs เพิ่มเติมที่ `docs/` folder
