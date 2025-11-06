# 🚀 Docker Quick Start Guide

เริ่มต้นใช้งาน Stock Management API ด้วย Docker ใน 5 นาที!

## 📦 ความต้องการ (Prerequisites)

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- Node.js 18+ (สำหรับรัน npm scripts)

ตรวจสอบ version:

```bash
docker --version
docker-compose --version
node --version
```

---

## 🎯 Quick Start - Production Mode

### ขั้นตอนที่ 1: ตั้งค่า Environment Variables

```bash
# คัดลอก template
cp .env.example .env

# แก้ไขค่าต่างๆ (ใช้ text editor ที่ชอบ)
nano .env
```

**สำคัญ!** ต้องเปลี่ยนค่าเหล่านี้:

```bash
JWT_SECRET=your_random_secret_key_here
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_LIFF_ID=your_liff_id
```

### ขั้นตอนที่ 2: Start Services

```bash
# Start database + backend
npm run docker:up

# หรือใช้ docker-compose โดยตรง
docker-compose up -d
```

### ขั้นตอนที่ 3: ตรวจสอบว่า API ทำงาน

```bash
# ตรวจสอบ logs
npm run docker:logs

# ทดสอบ health endpoint
curl http://localhost:3000/health

# เปิด API documentation
open http://localhost:3000/docs
```

### ขั้นตอนที่ 4: (Optional) รัน Database Migrations

```bash
# เข้าไปใน backend container
docker exec -it stock-management-api sh

# รัน migrations
npm run migration:run

# ออกจาก container
exit
```

---

## 🛠️ Quick Start - Development Mode

สำหรับพัฒนาระบบ (มี hot reload):

```bash
# Start database + backend (dev mode)
npm run docker:up:dev

# ดู logs
docker-compose logs -f backend-dev
```

Development mode จะ:

- Mount source code เข้า container (ไม่ต้อง rebuild)
- Auto-reload เมื่อแก้ไขโค้ด
- รันบน port 3001 (ไม่ซ้อนกับ production)

---

## 📝 คำสั่งที่ใช้บ่อย

### การจัดการ Services

```bash
# Start services
npm run docker:up

# Start development mode
npm run docker:up:dev

# Stop services
npm run docker:down

# Restart services
docker-compose restart

# Rebuild และ start (หลังแก้ Dockerfile)
npm run docker:rebuild
```

### การดู Logs

```bash
# ดู logs ทั้งหมด
npm run docker:logs

# ดู logs เฉพาะ backend
docker-compose logs -f backend

# ดู logs เฉพาะ database
docker-compose logs -f db

# ดู logs 50 บรรทัดล่าสุด
docker-compose logs --tail=50 backend
```

### การจัดการ Database

```bash
# เข้าไปใน MySQL shell
docker exec -it stock-management-db mysql -u testdrive -p

# Backup database
docker exec stock-management-db mysqldump -u testdrive -p stock_management > backup.sql

# Restore database
docker exec -i stock-management-db mysql -u testdrive -p stock_management < backup.sql

# ลบ database และ volumes (ระวัง! จะลบข้อมูลทั้งหมด)
docker-compose down -v
```

### การจัดการ Containers

```bash
# ดู running containers
docker-compose ps

# เข้าไปใน backend container
docker exec -it stock-management-api sh

# ดู resource usage
docker stats

# ลบ containers แต่เก็บ volumes
docker-compose down

# ลบทั้ง containers และ volumes
docker-compose down -v
```

---

## 🧪 ทดสอบ API

### Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### API Documentation

เปิดเบราว์เซอร์:

```
http://localhost:3000/docs
```

### ทดสอบ API Endpoints

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Get vehicles
curl http://localhost:3000/api/vehicles

# Get test drives
curl http://localhost:3000/api/test-drives
```

---

## 🔧 Troubleshooting

### ปัญหา: Port 3000 ถูกใช้งานแล้ว

```bash
# หา process ที่ใช้ port
lsof -i :3000

# Kill process
kill -9 <PID>

# หรือเปลี่ยน port ใน .env
echo "PORT=3001" >> .env
```

### ปัญหา: Database connection failed

```bash
# ตรวจสอบว่า database container ทำงาน
docker-compose ps db

# ดู logs ของ database
docker-compose logs db

# ตรวจสอบ health check
docker inspect stock-management-db | grep Health

# Restart database
docker-compose restart db
```

### ปัญหา: Cannot connect to Docker daemon

```bash
# Start Docker service
sudo systemctl start docker

# หรือบน macOS
open /Applications/Docker.app
```

### ปัญหา: Build ล้มเหลว

```bash
# ลบ build cache แล้ว rebuild
docker-compose build --no-cache

# หรือ
npm run docker:rebuild
```

### ปัญหา: Container ยัง restart ซ้ำๆ

```bash
# ดู logs เพื่อหาสาเหตุ
docker logs stock-management-api

# ตรวจสอบ environment variables
docker exec stock-management-api env

# ลองรัน container แบบ interactive
docker-compose up backend
```

---

## 🎨 โครงสร้าง Docker

```
stock-management/
├── Dockerfile              # Multi-stage build
├── docker-compose.yml      # Services definition
├── docker-entrypoint.sh    # Startup script
├── .dockerignore          # Files to ignore
└── .env                    # Environment variables
```

### Dockerfile Stages

1. **Builder Stage**: Build TypeScript → JavaScript
2. **Production Stage**: รัน built code เท่านั้น (image เล็ก)

### Docker Compose Services

- **db**: MySQL 8.0 database
- **backend**: Production API (port 3000)
- **backend-dev**: Development API with hot reload (port 3001)

---

## 📊 Monitoring

### Resource Usage

```bash
# ดู CPU/Memory/Network usage
docker stats

# ดู disk usage
docker system df

# ดู container details
docker inspect stock-management-api
```

### Health Checks

```bash
# ตรวจสอบ backend health
curl http://localhost:3000/health

# ตรวจสอบ database health
docker exec stock-management-db mysqladmin ping -h localhost -u testdrive -p
```

---

## 🧹 Clean Up

### ลบ Development Containers

```bash
# หยุดและลบ containers
npm run docker:down

# ลบรวมถึง volumes (database data)
docker-compose down -v
```

### ลบ Images

```bash
# ลบ local images
docker rmi stock-management-api:prod

# ลบ unused images ทั้งหมด
docker image prune -a
```

### ลบทุกอย่าง (Reset)

```bash
# ระวัง! คำสั่งนี้จะลบทุกอย่างของ Docker
docker system prune -a --volumes
```

---

## 🚀 Next Steps

หลังจากรัน Docker สำเร็จแล้ว:

1. **Deploy to Cloud**: ดู [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **Configure CI/CD**: ตั้งค่า auto-deployment
3. **Setup Monitoring**: เพิ่ม logging และ monitoring tools
4. **Secure API**: ตั้งค่า rate limiting, API keys, etc.

---

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)

---

## 💡 Tips

### Performance

- ใช้ `npm ci` แทน `npm install` ใน Dockerfile (เร็วกว่าและแน่นอนกว่า)
- ใช้ multi-stage build เพื่อลดขนาด image
- ใช้ `.dockerignore` เพื่อไม่ copy ไฟล์ที่ไม่จำเป็น

### Security

- อย่า commit `.env` file เข้า Git
- ใช้ non-root user ใน container
- Update base images เป็นประจำ
- Scan images สำหรับ vulnerabilities

### Development

- ใช้ named volumes สำหรับ database data
- Mount source code ใน development mode
- ใช้ different ports สำหรับ dev/prod

---

**Happy Coding! 🎉**
