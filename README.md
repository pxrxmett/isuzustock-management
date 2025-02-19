# Stock Management System

ระบบจัดการสต็อครถยนต์และการจองทดลองขับ

## โครงสร้างฐานข้อมูล

### ตาราง vehicle
| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary Key |
| vehicleCode | varchar | รหัสรถ |
| vinNumber | varchar | หมายเลข VIN |
| frontMotor | varchar | มอเตอร์ด้านหน้า |
| batteryNumber | varchar | หมายเลขแบตเตอรี่ |
| model | varchar | รุ่นรถ |
| color | varchar | สี |
| status | varchar | สถานะ |
| dealerCode | varchar | รหัสตัวแทนจำหน่าย |
| dealerName | varchar | ชื่อตัวแทนจำหน่าย |
| carType | varchar | ประเภทรถ |
| allocationDate | datetime | วันที่จัดสรร |
| price | decimal | ราคา |
| createdAt | datetime | วันที่สร้าง |
| updatedAt | datetime | วันที่อัพเดท |

### ตาราง test_drives
| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary Key |
| vehicle_id | int | Foreign Key to vehicle |
| customer_name | varchar | ชื่อลูกค้า |
| customer_phone | varchar | เบอร์โทรลูกค้า |
| start_time | datetime | เวลาเริ่มทดลองขับ |
| expected_end_time | datetime | เวลาสิ้นสุดที่คาดหวัง |
| responsible_staff | varchar | พนักงานผู้รับผิดชอบ |
| status | varchar | สถานะการจอง |
| createdAt | datetime | วันที่สร้าง |
| updatedAt | datetime | วันที่อัพเดท |

## API Endpoints

### Authentication
- POST /api/auth/login - เข้าสู่ระบบ

### Vehicle Management
- GET /api/stock/vehicles - ดูรายการรถทั้งหมด
- GET /api/stock/:id - ดูข้อมูลรถตาม ID
- POST /api/stock - เพิ่มข้อมูลรถ
- PATCH /api/stock/vehicles/:id/status - อัพเดทสถานะรถ
- DELETE /api/stock/vehicles/:id - ลบข้อมูลรถ
- POST /api/stock/upload - อัพโหลดข้อมูลรถ

### Test Drive Management
- GET /api/test-drives - ดูรายการจองทดลองขับทั้งหมด
- GET /api/test-drives/:id - ดูข้อมูลการจองตาม ID
- POST /api/test-drives - สร้างการจองทดลองขับ
- PATCH /api/test-drives/:id - อัพเดทข้อมูลการจอง
- DELETE /api/test-drives/:id - ยกเลิกการจอง
