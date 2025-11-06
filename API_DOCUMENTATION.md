# 📚 Events Management API Documentation

## Overview

Events Management API ให้บริการจัดการงาน (Events) ต่างๆ เช่น งานแสดงรถ งานทดลองขับ งานการตลาด และงานส่งมอบรถ โดยมีการเชื่อมโยงกับรถยนต์และพนักงานในระบบ

**Base URL:** `http://localhost:3000/api`

**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Event Endpoints](#event-endpoints)
   - [Create Event](#1-create-event)
   - [Get All Events](#2-get-all-events)
   - [Get Event by ID](#3-get-event-by-id)
   - [Update Event](#4-update-event)
   - [Delete Event](#5-delete-event)
   - [Assign Vehicle](#6-assign-vehicle-to-event)
   - [Batch Assign Vehicles](#7-batch-assign-vehicles)
   - [Unassign Vehicle](#8-unassign-vehicle)
   - [Get Event Vehicles](#9-get-event-vehicles)
   - [Update Event Status](#10-update-event-status)
   - [Get Calendar Events](#11-get-calendar-events)
3. [Data Models](#data-models)
4. [Status Codes](#status-codes)
5. [Error Responses](#error-responses)
6. [Examples](#examples)

---

## Authentication

ทุก endpoint ต้องมีการ authenticate ด้วย JWT token ใน Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin"
  }
}
```

---

## Event Endpoints

### 1. Create Event

สร้างงาน (Event) ใหม่ในระบบ

**Endpoint:** `POST /events`

**Request Body:**
```json
{
  "title": "งานแสดงรถยนต์ไฟฟ้า 2025",
  "description": "งานแสดงรถยนต์ไฟฟ้าครั้งใหญ่ ณ ศูนย์การค้าเซ็นทรัล",
  "type": "car_show",
  "status": "planning",
  "location": "ศูนย์การค้าเซ็นทรัลเวิลด์",
  "startDate": "2025-02-01",
  "endDate": "2025-02-05",
  "startTime": "09:00:00",
  "endTime": "18:00:00",
  "createdBy": "uuid-of-staff",
  "assignedStaffIds": ["uuid-1", "uuid-2", "uuid-3"],
  "notes": "เตรียมรถ 10 คัน และพนักงานขาย 5 คน"
}
```

**Field Descriptions:**
- `title` (required): ชื่องาน (string, max 255)
- `description` (optional): รายละเอียดงาน (text)
- `type` (required): ประเภทงาน
  - `car_show` - งานแสดงรถ
  - `test_drive` - งานทดลองขับ
  - `marketing` - งานการตลาด
  - `delivery` - งานส่งมอบรถ
  - `emergency` - งานเร่งด่วน
- `status` (optional, default: planning): สถานะงาน
  - `planning` - วางแผน
  - `preparing` - เตรียมการ
  - `in_progress` - กำลังดำเนินการ
  - `completed` - เสร็จสิ้น
  - `cancelled` - ยกเลิก
  - `overdue` - เลยกำหนด
- `location` (optional): สถานที่ (string, max 500)
- `startDate` (required): วันเริ่มงาน (YYYY-MM-DD)
- `endDate` (required): วันสิ้นสุดงาน (YYYY-MM-DD)
- `startTime` (optional): เวลาเริ่มงาน (HH:MM:SS)
- `endTime` (optional): เวลาสิ้นสุดงาน (HH:MM:SS)
- `createdBy` (optional): UUID ของผู้สร้างงาน (Staff ID)
- `assignedStaffIds` (optional): Array ของ Staff IDs ที่ได้รับมอบหมาย
- `notes` (optional): หมายเหตุเพิ่มเติม

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "งานแสดงรถยนต์ไฟฟ้า 2025",
  "description": "งานแสดงรถยนต์ไฟฟ้าครั้งใหญ่ ณ ศูนย์การค้าเซ็นทรัล",
  "type": "car_show",
  "status": "planning",
  "location": "ศูนย์การค้าเซ็นทรัลเวิลด์",
  "startDate": "2025-02-01",
  "endDate": "2025-02-05",
  "startTime": "09:00:00",
  "endTime": "18:00:00",
  "createdBy": "uuid-of-staff",
  "assignedStaffIds": ["uuid-1", "uuid-2", "uuid-3"],
  "notes": "เตรียมรถ 10 คัน และพนักงานขาย 5 คน",
  "vehicleCount": 0,
  "isActive": true,
  "createdAt": "2025-01-26T10:00:00.000Z",
  "updatedAt": "2025-01-26T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: วันที่ไม่ถูกต้อง (endDate < startDate)
- `401 Unauthorized`: ไม่ได้ authenticate
- `422 Unprocessable Entity`: ข้อมูล validation ไม่ผ่าน

---

### 2. Get All Events

ดึงรายการงานทั้งหมด พร้อม filters และ pagination

**Endpoint:** `GET /events`

**Query Parameters:**
- `status` (optional): กรองตามสถานะ (planning, preparing, in_progress, completed, cancelled, overdue)
- `type` (optional): กรองตามประเภท (car_show, test_drive, marketing, delivery, emergency)
- `startDate` (optional): ค้นหาตั้งแต่วันที่ (YYYY-MM-DD)
- `endDate` (optional): ค้นหาถึงวันที่ (YYYY-MM-DD)
- `search` (optional): ค้นหาจากชื่อหรือรายละเอียด
- `isActive` (optional): true/false - กรองงานที่ active
- `page` (optional, default: 1): หน้าที่ต้องการ
- `limit` (optional, default: 10): จำนวนรายการต่อหน้า

**Example Request:**
```bash
GET /events?status=planning&type=car_show&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "งานแสดงรถยนต์ไฟฟ้า 2025",
      "description": "งานแสดงรถยนต์ไฟฟ้าครั้งใหญ่",
      "type": "car_show",
      "status": "planning",
      "location": "ศูนย์การค้าเซ็นทรัลเวิลด์",
      "startDate": "2025-02-01",
      "endDate": "2025-02-05",
      "startTime": "09:00:00",
      "endTime": "18:00:00",
      "vehicleCount": 5,
      "isActive": true,
      "creator": {
        "id": "uuid-staff",
        "firstName": "John",
        "lastName": "Doe"
      },
      "eventVehicles": [
        {
          "id": "ev-uuid-1",
          "vehicleId": 1,
          "vehicle": {
            "id": 1,
            "vehicleCode": "DLR001-001",
            "model": "D-MAX"
          }
        }
      ],
      "createdAt": "2025-01-26T10:00:00.000Z",
      "updatedAt": "2025-01-26T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 3. Get Event by ID

ดึงข้อมูลงานตาม ID พร้อมข้อมูลรถและพนักงานที่เกี่ยวข้อง

**Endpoint:** `GET /events/:id`

**URL Parameters:**
- `id` (required): Event ID (UUID)

**Example Request:**
```bash
GET /events/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "งานแสดงรถยนต์ไฟฟ้า 2025",
  "description": "งานแสดงรถยนต์ไฟฟ้าครั้งใหญ่",
  "type": "car_show",
  "status": "planning",
  "location": "ศูนย์การค้าเซ็นทรัลเวิลด์",
  "startDate": "2025-02-01",
  "endDate": "2025-02-05",
  "startTime": "09:00:00",
  "endTime": "18:00:00",
  "createdBy": "uuid-of-staff",
  "assignedStaffIds": ["uuid-1", "uuid-2"],
  "notes": "เตรียมรถ 10 คัน",
  "vehicleCount": 3,
  "isActive": true,
  "creator": {
    "id": "uuid-staff",
    "firstName": "John",
    "lastName": "Doe",
    "position": "Manager"
  },
  "eventVehicles": [
    {
      "id": "ev-uuid-1",
      "vehicleId": 1,
      "vehicle": {
        "id": 1,
        "vehicleCode": "DLR001-001",
        "model": "D-MAX",
        "color": "ขาว",
        "status": "locked_for_event"
      },
      "assignedBy": "uuid-staff",
      "notes": "รถหลัก สำหรับจัดแสดง",
      "assignedAt": "2025-01-26T11:00:00.000Z"
    }
  ],
  "createdAt": "2025-01-26T10:00:00.000Z",
  "updatedAt": "2025-01-26T10:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: ไม่พบงาน

---

### 4. Update Event

แก้ไขข้อมูลงาน

**Endpoint:** `PATCH /events/:id`

**URL Parameters:**
- `id` (required): Event ID (UUID)

**Request Body:** (ทุกฟิลด์ optional)
```json
{
  "title": "งานแสดงรถยนต์ไฟฟ้า 2025 (แก้ไข)",
  "status": "preparing",
  "location": "ศูนย์การค้าเซ็นทรัลพระราม 3",
  "notes": "อัปเดต: เปลี่ยนสถานที่"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "งานแสดงรถยนต์ไฟฟ้า 2025 (แก้ไข)",
  "status": "preparing",
  "location": "ศูนย์การค้าเซ็นทรัลพระราม 3",
  ...
}
```

**Error Responses:**
- `400 Bad Request`: วันที่ไม่ถูกต้อง
- `404 Not Found`: ไม่พบงาน

---

### 5. Delete Event

ลบงาน (ไม่สามารถลบงานที่กำลังดำเนินการได้)

**Endpoint:** `DELETE /events/:id`

**URL Parameters:**
- `id` (required): Event ID (UUID)

**Response (204 No Content)**

**Error Responses:**
- `400 Bad Request`: ไม่สามารถลบงานที่กำลังดำเนินการได้
- `404 Not Found`: ไม่พบงาน

**Note:** เมื่อลบงาน รถทั้งหมดที่ถูก lock จะถูกปลดล็อคอัตโนมัติ

---

### 6. Assign Vehicle to Event

เพิ่มรถเข้างาน (Assign)

**Endpoint:** `POST /events/:id/vehicles`

**URL Parameters:**
- `id` (required): Event ID (UUID)

**Request Body:**
```json
{
  "vehicleId": 1,
  "assignedBy": "uuid-of-staff",
  "notes": "รถสำหรับจัดแสดง"
}
```

**Field Descriptions:**
- `vehicleId` (required): ID ของรถที่ต้องการ assign
- `assignedBy` (optional): Staff ID ของผู้ที่ทำการ assign
- `notes` (optional): หมายเหตุ

**Response (201 Created):**
```json
{
  "id": "ev-uuid-1",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleId": 1,
  "assignedBy": "uuid-of-staff",
  "notes": "รถสำหรับจัดแสดง",
  "assignedAt": "2025-01-26T11:00:00.000Z"
}
```

**What Happens:**
1. รถจะถูก lock (`isLockedForEvent = true`)
2. สถานะรถเปลี่ยนเป็น `locked_for_event`
3. `currentEventId` ของรถถูกตั้งค่าเป็น event นี้
4. `vehicleCount` ของ event เพิ่มขึ้น

**Error Responses:**
- `404 Not Found`: ไม่พบงานหรือไม่พบรถ
- `409 Conflict`: 
  - รถถูก assign ในงานนี้แล้ว
  - รถถูก lock สำหรับงานอื่น

---

### 7. Batch Assign Vehicles

เพิ่มรถหลายคันเข้างานพร้อมกัน

**Endpoint:** `POST /events/:id/vehicles/batch`

**URL Parameters:**
- `id` (required): Event ID (UUID)

**Request Body:**
```json
{
  "vehicleIds": [1, 2, 3, 4, 5],
  "assignedBy": "uuid-of-staff",
  "notes": "รถทั้งหมดสำหรับงานนี้"
}
```

**Response (201 Created):**
```json
{
  "success": 4,
  "failed": 1,
  "errors": [
    "Vehicle 3: รถถูก lock สำหรับงานอื่นอยู่ (Event ID: another-event-uuid)"
  ]
}
```

**Use Case:** เหมาะสำหรับ assign รถจำนวนมากพร้อมกัน โดยถ้ารถบางคันมีปัญหา ระบบจะข้ามไปและทำรถคันถัดไป

---

### 8. Unassign Vehicle

ลบรถออกจากงาน (Unassign และปลดล็อค)

**Endpoint:** `DELETE /events/:id/vehicles/:vehicleId`

**URL Parameters:**
- `id` (required): Event ID (UUID)
- `vehicleId` (required): Vehicle ID (number)

**Example Request:**
```bash
DELETE /events/550e8400-e29b-41d4-a716-446655440000/vehicles/1
```

**Response (204 No Content)**

**What Happens:**
1. ลบ assignment ออก
2. ปลดล็อครถ (`isLockedForEvent = false`)
3. สถานะรถกลับเป็น `available`
4. `currentEventId` ถูก clear
5. `vehicleCount` ของ event ลดลง

**Error Responses:**
- `404 Not Found`: ไม่พบงานหรือไม่พบรถในงาน

---

### 9. Get Event Vehicles

ดึงรายการรถทั้งหมดในงาน

**Endpoint:** `GET /events/:id/vehicles`

**URL Parameters:**
- `id` (required): Event ID (UUID)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "vehicleCode": "DLR001-001",
    "vinNumber": "VIN12345678901234",
    "model": "D-MAX",
    "color": "ขาว",
    "status": "locked_for_event",
    "isLockedForEvent": true,
    "currentEventId": "550e8400-e29b-41d4-a716-446655440000",
    "assignedAt": "2025-01-26T11:00:00.000Z",
    "notes": "รถสำหรับจัดแสดง",
    "assignedBy": "uuid-of-staff"
  },
  {
    "id": 2,
    "vehicleCode": "DLR001-002",
    "model": "MU-X",
    "color": "ดำ",
    "status": "locked_for_event",
    "assignedAt": "2025-01-26T11:05:00.000Z"
  }
]
```

---

### 10. Update Event Status

เปลี่ยนสถานะงาน

**Endpoint:** `PATCH /events/:id/status`

**URL Parameters:**
- `id` (required): Event ID (UUID)

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Valid Status Values:**
- `planning` - วางแผน
- `preparing` - เตรียมการ
- `in_progress` - กำลังดำเนินการ
- `completed` - เสร็จสิ้น
- `cancelled` - ยกเลิก
- `overdue` - เลยกำหนด

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "in_progress",
  ...
}
```

**Important Note:**
- เมื่อเปลี่ยนเป็น `completed` หรือ `cancelled` รถทั้งหมดจะถูกปลดล็อคอัตโนมัติ

---

### 11. Get Calendar Events

ดึงข้อมูลงานสำหรับแสดงใน Calendar (ในช่วงเวลาที่กำหนด)

**Endpoint:** `GET /events/calendar/view`

**Query Parameters:**
- `startDate` (required): วันเริ่มต้น (YYYY-MM-DD)
- `endDate` (required): วันสิ้นสุด (YYYY-MM-DD)

**Example Request:**
```bash
GET /events/calendar/view?startDate=2025-01-01&endDate=2025-12-31
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "งานแสดงรถยนต์ไฟฟ้า 2025",
    "start": "2025-02-01",
    "end": "2025-02-05",
    "startTime": "09:00:00",
    "endTime": "18:00:00",
    "type": "car_show",
    "status": "planning",
    "location": "ศูนย์การค้าเซ็นทรัลเวิลด์",
    "vehicleCount": 5
  },
  {
    "id": "another-uuid",
    "title": "งานทดลองขับ MU-X",
    "start": "2025-02-10",
    "end": "2025-02-10",
    "type": "test_drive",
    "status": "preparing",
    "vehicleCount": 2
  }
]
```

**Use Case:** สำหรับแสดงงานบน Calendar component ใน frontend

---

## Data Models

### Event Model

```typescript
{
  id: string;                 // UUID
  title: string;              // ชื่องาน
  description?: string;       // รายละเอียด
  type: EventType;            // ประเภทงาน
  status: EventStatus;        // สถานะ
  location?: string;          // สถานที่
  startDate: Date;            // วันเริ่ม
  endDate: Date;              // วันสิ้นสุด
  startTime?: string;         // เวลาเริ่ม
  endTime?: string;           // เวลาสิ้นสุด
  createdBy?: string;         // UUID ของผู้สร้าง
  assignedStaffIds?: string[];  // Array ของ Staff IDs
  notes?: string;             // หมายเหตุ
  vehicleCount: number;       // จำนวนรถ
  isActive: boolean;          // สถานะ active
  createdAt: Date;
  updatedAt: Date;
}
```

### EventType Enum

```typescript
enum EventType {
  CAR_SHOW = 'car_show',       // งานแสดงรถ
  TEST_DRIVE = 'test_drive',   // งานทดลองขับ
  MARKETING = 'marketing',     // งานการตลาด
  DELIVERY = 'delivery',       // งานส่งมอบรถ
  EMERGENCY = 'emergency',     // งานเร่งด่วน
}
```

### EventStatus Enum

```typescript
enum EventStatus {
  PLANNING = 'planning',           // วางแผน
  PREPARING = 'preparing',         // เตรียมการ
  IN_PROGRESS = 'in_progress',     // กำลังดำเนินการ
  COMPLETED = 'completed',         // เสร็จสิ้น
  CANCELLED = 'cancelled',         // ยกเลิก
  OVERDUE = 'overdue',             // เลยกำหนด
}
```

### Vehicle Status (Enhanced)

```typescript
enum VehicleStatus {
  AVAILABLE = 'available',                    // พร้อมใช้งาน
  UNAVAILABLE = 'unavailable',                // ไม่พร้อมใช้งาน
  IN_USE = 'in_use',                          // อยู่ในระหว่างการใช้งาน
  MAINTENANCE = 'maintenance',                // ซ่อมบำรุง
  LOCKED_FOR_EVENT = 'locked_for_event',      // ถูกล็อคสำหรับงาน
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request สำเร็จ |
| 201  | Created - สร้างข้อมูลสำเร็จ |
| 204  | No Content - ลบสำเร็จ |
| 400  | Bad Request - ข้อมูลไม่ถูกต้อง |
| 401  | Unauthorized - ไม่ได้ authenticate |
| 403  | Forbidden - ไม่มีสิทธิ์ |
| 404  | Not Found - ไม่พบข้อมูล |
| 409  | Conflict - ข้อมูลขัดแย้ง |
| 422  | Unprocessable Entity - Validation ไม่ผ่าน |
| 500  | Internal Server Error - เกิดข้อผิดพลาดในระบบ |

---

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น",
  "error": "Bad Request"
}
```

### Validation Error

```json
{
  "statusCode": 422,
  "message": [
    "title should not be empty",
    "startDate must be a valid ISO 8601 date string"
  ],
  "error": "Unprocessable Entity"
}
```

---

## Examples

### Example 1: Create Event and Assign Vehicles

```bash
# 1. สร้าง Event
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "งานแสดงรถ MU-X 2025",
    "type": "car_show",
    "startDate": "2025-03-01",
    "endDate": "2025-03-03",
    "location": "ศูนย์การค้าเซ็นทรัลเวิลด์"
  }'

# Response: { "id": "event-uuid-123", ... }

# 2. Assign รถเข้างาน
curl -X POST http://localhost:3000/api/events/event-uuid-123/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "notes": "รถหลัก สำหรับจัดแสดง"
  }'

# 3. Batch assign รถอีก 5 คัน
curl -X POST http://localhost:3000/api/events/event-uuid-123/vehicles/batch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleIds": [2, 3, 4, 5, 6]
  }'
```

### Example 2: Search Events

```bash
# ค้นหางานแสดงรถที่กำลังวางแผน
curl -X GET "http://localhost:3000/api/events?type=car_show&status=planning" \
  -H "Authorization: Bearer YOUR_TOKEN"

# ค้นหางานในช่วง Feb 2025
curl -X GET "http://localhost:3000/api/events?startDate=2025-02-01&endDate=2025-02-28" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Full-text search
curl -X GET "http://localhost:3000/api/events?search=ไฟฟ้า" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 3: Update Event Status

```bash
# เปลี่ยนสถานะเป็น "กำลังดำเนินการ"
curl -X PATCH http://localhost:3000/api/events/event-uuid-123/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'

# เสร็จสิ้นงาน (รถจะถูกปลดล็อคอัตโนมัติ)
curl -X PATCH http://localhost:3000/api/events/event-uuid-123/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Example 4: Get Calendar Events

```bash
# ดึงงานทั้งหมดในปี 2025 สำหรับแสดงใน calendar
curl -X GET "http://localhost:3000/api/events/calendar/view?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Best Practices

### 1. การ Lock รถ

- ก่อน assign รถเข้างาน ควรตรวจสอบว่ารถพร้อมใช้งาน
- ระบบจะ lock รถอัตโนมัติเมื่อ assign
- รถที่ถูก lock จะมี status = `locked_for_event`

### 2. การจัดการสถานะงาน

**Flow ปกติ:**
```
planning → preparing → in_progress → completed
```

**การยกเลิก:**
```
planning/preparing → cancelled
```

### 3. Pagination

- Default: `page=1`, `limit=10`
- Maximum limit: 100
- ใช้ `meta.totalPages` เพื่อนำทาง

### 4. Date Format

- **Date:** YYYY-MM-DD (ISO 8601)
- **Time:** HH:MM:SS (24-hour format)
- **DateTime:** ISO 8601 string

### 5. Error Handling

```javascript
try {
  const response = await fetch('/api/events', { ... });
  if (!response.ok) {
    const error = await response.json();
    console.error(error.message);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Changelog

### Version 1.0.0 (2025-01-26)

**Initial Release:**
- ✅ 11 Events Management endpoints
- ✅ Vehicle assignment system
- ✅ Event-Vehicle locking mechanism
- ✅ Calendar view support
- ✅ Batch operations
- ✅ Full Swagger documentation

---

## Support

For issues or questions, please contact:
- **Email:** support@isuzustock.com
- **GitHub:** https://github.com/pxrxmett/isuzustock-management

---

**Last Updated:** 2025-01-26
**API Version:** 1.0.0
