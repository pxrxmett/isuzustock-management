# 🔗 LINE Registration Guide
## วิธีแก้ปัญหา: ไม่สามารถเข้าสู่ระบบด้วย LINE ได้

---

## 🚨 ปัญหา
```json
{
  "message": "ไม่ได้รับอนุญาตให้เข้าถึง",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**สาเหตุ:** LINE User ID ยังไม่ได้เชื่อมโยงกับข้อมูลพนักงานในระบบ

---

## ✅ วิธีแก้ (3 วิธี)

### วิธีที่ 1: เชื่อมโยงผ่าน Frontend (แนะนำ)

Frontend ต้องเรียก API นี้หลังจาก LINE login สำเร็จ:

```javascript
// 1. ผู้ใช้ login ผ่าน LINE LIFF
const profile = await liff.getProfile();
const accessToken = liff.getAccessToken();

// 2. เช็คว่าเคยเชื่อมโยงหรือไม่
const checkResult = await fetch('/api/line-integration/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lineUserId: profile.userId
  })
});

// 3. ถ้ายังไม่เชื่อมโยง -> แสดงฟอร์มให้กรอก Staff Code
if (!checkResult.registered) {
  const staffCode = prompt('กรุณากรอกรหัสพนักงาน:');

  // 4. เชื่อมโยงบัญชี
  const linkResult = await fetch('/api/line-integration/link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      staffCode: staffCode,
      lineUserId: profile.userId,
      lineAccessToken: accessToken
    })
  });

  if (linkResult.success) {
    alert('เชื่อมโยงบัญชีสำเร็จ!');
    // เช็คอีกครั้ง -> จะได้ token กลับมา
  }
}
```

---

### วิธีที่ 2: เชื่อมโยงผ่าน API โดยตรง (สำหรับ Admin)

Admin สามารถเชื่อมโยง LINE User ID กับ Staff ได้โดยตรง:

```bash
curl -X POST https://your-backend.railway.app/api/line-integration/link \
  -H "Content-Type: application/json" \
  -d '{
    "staffCode": "STAFF001",
    "lineUserId": "U1234567890abcdef",
    "lineAccessToken": "LINE_ACCESS_TOKEN_HERE"
  }'
```

**Response สำเร็จ:**
```json
{
  "success": true,
  "message": "เชื่อมโยง LINE กับพนักงานสำเร็จ",
  "staffInfo": {
    "id": "uuid",
    "staffCode": "STAFF001",
    "fullName": "John Doe"
  },
  "lineInfo": {
    "userId": "U1234567890abcdef",
    "displayName": "John LINE"
  }
}
```

---

### วิธีที่ 3: เชื่อมโยงผ่าน Database โดยตรง (Emergency)

เชื่อมต่อ Railway MySQL และ run SQL:

```sql
-- 1. หา Staff ID ที่ต้องการเชื่อมโยง
SELECT id, staff_code, first_name, last_name
FROM staffs
WHERE staff_code = 'STAFF001';

-- 2. Update LINE User ID
UPDATE staffs
SET
  line_user_id = 'U1234567890abcdef',
  line_display_name = 'John LINE',
  line_last_login_at = NOW(),
  is_line_linked = 1
WHERE staff_code = 'STAFF001';

-- 3. ตรวจสอบ
SELECT staff_code, first_name, last_name, line_user_id, is_line_linked
FROM staffs
WHERE staff_code = 'STAFF001';
```

---

## 🔍 วิธีหา LINE User ID

### จาก Frontend:
```javascript
const liff = window.liff;
await liff.init({ liffId: 'YOUR_LIFF_ID' });
const profile = await liff.getProfile();
console.log('LINE User ID:', profile.userId);
```

### จาก Browser Console:
1. เปิด LIFF App
2. เปิด Developer Tools (F12)
3. Console tab
4. พิมพ์:
```javascript
liff.getProfile().then(p => console.log('LINE User ID:', p.userId))
```

---

## 📋 API Endpoints

### 1. ตรวจสอบการเชื่อมโยง
```http
POST /api/line-integration/check
Content-Type: application/json

{
  "lineUserId": "U1234567890abcdef"
}
```

**Response (ยังไม่เชื่อมโยง):**
```json
{
  "registered": false,
  "staffInfo": null
}
```

**Response (เชื่อมโยงแล้ว):**
```json
{
  "registered": true,
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "uuid",
    "staffCode": "STAFF001",
    "fullName": "John Doe",
    "role": "staff",
    "lineUserId": "U1234567890abcdef"
  }
}
```

### 2. เชื่อมโยงบัญชี
```http
POST /api/line-integration/link
Content-Type: application/json

{
  "staffCode": "STAFF001",
  "lineUserId": "U1234567890abcdef",
  "lineAccessToken": "LINE_ACCESS_TOKEN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "เชื่อมโยง LINE กับพนักงานสำเร็จ",
  "staffInfo": {
    "id": "uuid",
    "staffCode": "STAFF001",
    "fullName": "John Doe"
  }
}
```

---

## 🛠️ Troubleshooting

### Error: "ไม่พบข้อมูลพนักงาน"
- ตรวจสอบว่า Staff Code ถูกต้อง
- เช็คว่า Staff มีอยู่ในฐานข้อมูล
- เช็คว่า status = 'active'

### Error: "LINE นี้ได้เชื่อมโยงกับพนักงานอื่นแล้ว"
- LINE User ID นี้ถูกใช้ไปแล้ว
- ต้อง unlink ก่อน:
```sql
UPDATE staffs
SET line_user_id = NULL, is_line_linked = 0
WHERE line_user_id = 'U1234567890abcdef';
```

### Error: "LINE Token ไม่ตรงกับ LINE User ID"
- Access Token หมดอายุ
- ให้ Login LINE ใหม่และลองอีกครั้ง

---

## 🔐 Security Notes

- LINE Access Token จะถูกใช้เพื่อดึงข้อมูล Profile จาก LINE API
- Token ไม่ถูกเก็บในฐานข้อมูล (ใช้แค่ตอน verification)
- เก็บเฉพาะ LINE User ID, Display Name, Picture URL
- JWT Token มีอายุ 24 ชั่วโมง

---

## 📞 ติดต่อ Support

หากยังแก้ปัญหาไม่ได้:
1. ให้แจ้ง Admin พร้อม LINE User ID
2. Admin จะเชื่อมโยงบัญชีให้ในระบบ
3. หลังจากนั้น Login LINE ใหม่อีกครั้ง

---

## ✨ Flow ที่ถูกต้อง

```
1. ผู้ใช้ลงทะเบียนเป็น Staff ในระบบ
   ↓
2. Admin สร้าง Staff record (staff_code, ชื่อ, เบอร์, email)
   ↓
3. Staff Login ผ่าน LINE LIFF App
   ↓
4. Frontend เรียก /api/line-integration/check
   ↓
5. ถ้า registered = false → แสดงฟอร์มให้กรอก Staff Code
   ↓
6. Frontend เรียก /api/line-integration/link พร้อม Staff Code
   ↓
7. Backend verify และเชื่อมโยง LINE User ID กับ Staff
   ↓
8. Frontend เรียก /api/line-integration/check อีกครั้ง
   ↓
9. ได้ JWT Token กลับมา → เข้าสู่ระบบสำเร็จ ✅
```

---

## 🎯 สรุป

**ปัญหา:** LINE User ID ยังไม่ถูกเชื่อมโยงกับ Staff

**วิธีแก้:**
1. Frontend ต้องเรียก `/api/line-integration/link` พร้อม Staff Code
2. หรือ Admin เชื่อมโยงผ่าน API/Database โดยตรง

**หลังแก้:** Login LINE อีกครั้ง จะได้ JWT Token และเข้าสู่ระบบสำเร็จ!
