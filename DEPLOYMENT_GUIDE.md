# 🚀 คู่มือการ Deploy NestJS Stock Management API

## 📋 สารบัญ

- [เตรียม Environment Variables](#-environment-variables)
- [Deploy ด้วย Docker (Local)](#-deploy-ดวย-docker-local)
- [Deploy บน Railway](#-deploy-บน-railway)
- [Deploy บน Render](#-deploy-บน-render)
- [Deploy บน Google Cloud Run](#-deploy-บน-google-cloud-run)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Environment Variables

สร้างไฟล์ `.env` สำหรับ production:

```bash
# คัดลอกจาก .env.example
cp .env.example .env
```

### ตัวแปรที่จำเป็น (Required)

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password
DB_DATABASE=stock_management

# JWT Secret (สำคัญมาก! ต้องเปลี่ยนใน production)
# สร้าง secret key ด้วยคำสั่ง: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# LINE Credentials
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_LIFF_ID=your_liff_id

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 🐳 Deploy ด้วย Docker (Local)

### วิธีที่ 1: ใช้ Docker Compose (แนะนำ)

#### Production Mode

```bash
# 1. สร้างไฟล์ .env
cp .env.example .env
nano .env  # แก้ไข environment variables

# 2. Build และรันด้วย Docker Compose
npm run docker:up

# 3. ตรวจสอบ logs
npm run docker:logs

# 4. ทดสอบ API
curl http://localhost:3000/health
```

#### Development Mode

```bash
# รัน development mode (hot reload)
npm run docker:up:dev

# ดู logs
docker-compose logs -f backend-dev
```

#### คำสั่งอื่นๆ

```bash
# หยุด services
npm run docker:down

# Rebuild containers
npm run docker:rebuild

# ลบ containers และ volumes ทั้งหมด
docker-compose down -v
```

### วิธีที่ 2: ใช้ Docker โดยตรง

```bash
# 1. Build image
npm run docker:build:prod

# 2. รัน container
docker run -d \
  --name stock-management-api \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  stock-management-api:prod

# 3. ตรวจสอบ logs
docker logs -f stock-management-api

# 4. หยุด container
docker stop stock-management-api
docker rm stock-management-api
```

### Database Migration

```bash
# เข้าไปใน container
docker exec -it stock-management-api sh

# รัน migrations
npm run migration:run

# ออกจาก container
exit
```

---

## 🚂 Deploy บน Railway

[Railway](https://railway.app) เหมาะสำหรับ deploy แบบง่ายๆ พร้อม MySQL database

### ขั้นตอนการ Deploy

1. **สร้างโปรเจคใหม่**

   ```bash
   # ติดตั้ง Railway CLI (ถ้ายังไม่มี)
   npm install -g @railway/cli

   # Login
   railway login

   # สร้างโปรเจค
   railway init
   ```

2. **เพิ่ม MySQL Database**

   - ไปที่ Railway Dashboard
   - คลิก "+ New" → "Database" → "MySQL"
   - Railway จะสร้าง environment variables อัตโนมัติ:
     - `MYSQL_DATABASE`
     - `MYSQL_USER`
     - `MYSQL_PASSWORD`
     - `MYSQL_ROOT_PASSWORD`
     - `MYSQL_URL`

3. **ตั้งค่า Environment Variables**

   ไปที่ "Variables" tab และเพิ่ม:

   ```bash
   NODE_ENV=production
   PORT=3000

   # Database (Railway จะสร้างให้อัตโนมัติ)
   DB_HOST=${{MySQL.MYSQL_HOST}}
   DB_PORT=${{MySQL.MYSQL_PORT}}
   DB_USERNAME=${{MySQL.MYSQL_USER}}
   DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
   DB_DATABASE=${{MySQL.MYSQL_DATABASE}}

   # JWT Secret (สร้าง random string)
   JWT_SECRET=your_production_jwt_secret

   # LINE Credentials
   LINE_CHANNEL_ID=your_channel_id
   LINE_CHANNEL_SECRET=your_channel_secret
   LINE_LIFF_ID=your_liff_id

   # CORS
   FRONTEND_URL=https://your-frontend-url.railway.app
   ```

4. **Deploy**

   ```bash
   # Deploy จาก CLI
   railway up

   # หรือ push ไป GitHub แล้วเชื่อม Railway กับ repo
   # Railway จะ auto-deploy ทุกครั้งที่ push
   ```

5. **รัน Migrations**

   ```bash
   # เชื่อมต่อกับ Railway project
   railway link

   # รัน migrations
   railway run npm run migration:run
   ```

6. **ตรวจสอบ**

   ```bash
   # เปิด app
   railway open

   # ดู logs
   railway logs
   ```

### Railway Configuration Files

Railway ใช้ไฟล์ที่มีอยู่แล้ว:

**`src/nixpacks.toml`** (ถ้ามี):

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.build]
cmds = ["npm ci", "npm run build"]

[start]
cmd = "node dist/main"
```

---

## 🎨 Deploy บน Render

[Render](https://render.com) มี free tier พร้อม auto-deploy

### ขั้นตอนการ Deploy

1. **สร้าง Web Service**

   - ไปที่ [Render Dashboard](https://dashboard.render.com)
   - คลิก "New +" → "Web Service"
   - เชื่อมต่อ GitHub repository

2. **ตั้งค่า Build & Deploy**

   ```
   Name: stock-management-api
   Environment: Docker
   Region: Singapore (ใกล้ที่สุด)
   Branch: main
   ```

3. **Docker Configuration**

   Render จะใช้ `Dockerfile` ที่เราสร้างไว้อัตโนมัติ

4. **ตั้งค่า Environment Variables**

   ไปที่ "Environment" tab:

   ```bash
   NODE_ENV=production
   PORT=3000

   # Database (ต้องสร้าง MySQL database ก่อน)
   DB_HOST=your-db-host.render.com
   DB_PORT=3306
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=stock_management

   # JWT Secret
   JWT_SECRET=your_production_jwt_secret

   # LINE Credentials
   LINE_CHANNEL_ID=your_channel_id
   LINE_CHANNEL_SECRET=your_channel_secret
   LINE_LIFF_ID=your_liff_id

   # CORS
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

5. **สร้าง MySQL Database**

   Render ไม่มี MySQL free tier ต้องใช้วิธีอื่น:

   - **Option 1**: ใช้ Railway/PlanetScale สำหรับ database
   - **Option 2**: ใช้ Render PostgreSQL (ต้องแก้โค้ดเป็น PostgreSQL)
   - **Option 3**: ใช้ external MySQL service (e.g., AWS RDS, DigitalOcean)

6. **Deploy**

   คลิก "Create Web Service" → Render จะ build และ deploy อัตโนมัติ

7. **รัน Migrations**

   ใช้ Render Shell:

   ```bash
   # ไปที่ service dashboard → Shell tab
   npm run migration:run
   ```

---

## ☁️ Deploy บน Google Cloud Run

Cloud Run เหมาะกับ production ขนาดใหญ่

### ขั้นตอนการ Deploy

1. **ติดตั้ง Google Cloud SDK**

   ```bash
   # macOS
   brew install google-cloud-sdk

   # Ubuntu/Debian
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

2. **Login และสร้างโปรเจค**

   ```bash
   # Login
   gcloud auth login

   # สร้างโปรเจค
   gcloud projects create stock-management-api
   gcloud config set project stock-management-api

   # เปิดใช้งาน Cloud Run API
   gcloud services enable run.googleapis.com
   gcloud services enable sql-component.googleapis.com
   ```

3. **สร้าง Cloud SQL (MySQL)**

   ```bash
   # สร้าง MySQL instance
   gcloud sql instances create stock-db \
     --database-version=MYSQL_8_0 \
     --tier=db-f1-micro \
     --region=asia-southeast1 \
     --root-password=your_root_password

   # สร้าง database
   gcloud sql databases create stock_management \
     --instance=stock-db

   # สร้าง user
   gcloud sql users create stockuser \
     --instance=stock-db \
     --password=your_secure_password
   ```

4. **Build และ Push Docker Image**

   ```bash
   # ตั้งค่า Google Container Registry
   gcloud auth configure-docker asia-southeast1-docker.pkg.dev

   # สร้าง Artifact Registry repository
   gcloud artifacts repositories create stock-management \
     --repository-format=docker \
     --location=asia-southeast1

   # Build image
   docker build -t asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/stock-management/api:latest .

   # Push image
   docker push asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/stock-management/api:latest
   ```

5. **Deploy ไป Cloud Run**

   ```bash
   gcloud run deploy stock-management-api \
     --image asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/stock-management/api:latest \
     --platform managed \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --port 3000 \
     --set-env-vars NODE_ENV=production \
     --set-env-vars JWT_SECRET=your_jwt_secret \
     --set-env-vars LINE_CHANNEL_ID=your_channel_id \
     --set-env-vars LINE_CHANNEL_SECRET=your_channel_secret \
     --set-env-vars LINE_LIFF_ID=your_liff_id \
     --set-cloudsql-instances PROJECT_ID:asia-southeast1:stock-db \
     --set-env-vars DB_HOST=/cloudsql/PROJECT_ID:asia-southeast1:stock-db \
     --set-env-vars DB_USERNAME=stockuser \
     --set-env-vars DB_PASSWORD=your_secure_password \
     --set-env-vars DB_DATABASE=stock_management \
     --min-instances 0 \
     --max-instances 10 \
     --memory 512Mi \
     --cpu 1
   ```

6. **รัน Migrations**

   ```bash
   # รัน migration job
   gcloud run jobs create migration-job \
     --image asia-southeast1-docker.pkg.dev/YOUR_PROJECT_ID/stock-management/api:latest \
     --region asia-southeast1 \
     --set-env-vars "NODE_ENV=production,DB_HOST=...,DB_USERNAME=...,DB_PASSWORD=...,DB_DATABASE=..." \
     --set-cloudsql-instances PROJECT_ID:asia-southeast1:stock-db \
     --command npm \
     --args run,migration:run

   # Execute job
   gcloud run jobs execute migration-job
   ```

---

## 🔍 Troubleshooting

### ปัญหา: Error "Cannot find module '/app/dist/main'"

**สาเหตร**: Build ไม่สำเร็จหรือไฟล์ dist ไม่ถูก copy

**แก้ไข**:

```bash
# 1. ตรวจสอบว่า build สำเร็จ
npm run build
ls -la dist/

# 2. ตรวจสอบ Dockerfile
# ต้องมี COPY dist ใน production stage

# 3. ใช้ Dockerfile ใหม่ที่เราสร้าง (multi-stage build)
npm run docker:rebuild
```

### ปัญหา: Database connection failed

**แก้ไข**:

```bash
# 1. ตรวจสอบ environment variables
docker exec stock-management-api env | grep DB_

# 2. ทดสอบ connection จากภายใน container
docker exec -it stock-management-api sh
npm run typeorm query "SELECT 1"

# 3. ตรวจสอบว่า database service พร้อมใช้งาน
docker-compose ps
```

### ปัญหา: Port already in use

**แก้ไข**:

```bash
# หา process ที่ใช้ port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# หรือเปลี่ยน port
PORT=3001 npm run docker:up
```

### ปัญหา: Migration failed

**แก้ไข**:

```bash
# 1. ตรวจสอบ migrations ที่มี
npm run migration:show

# 2. Revert migration ล่าสุด
npm run migration:revert

# 3. ลองรันใหม่
npm run migration:run

# 4. ถ้ายังไม่ได้ ให้ manual sync (development only)
# แก้ไข TypeORM config: synchronize: true
```

### ปัญหา: Container keeps restarting

**แก้ไข**:

```bash
# ดู logs
docker logs stock-management-api

# ดู logs แบบ follow
docker logs -f stock-management-api

# ตรวจสอบ health check
docker inspect stock-management-api | grep Health
```

### ปัญหา: CORS error

**แก้ไข**:

```bash
# 1. เพิ่ม frontend URL ใน .env
FRONTEND_URL=https://your-frontend-domain.com

# 2. ตรวจสอบ main.ts ว่า CORS config ถูกต้อง
# 3. Rebuild container
npm run docker:rebuild
```

---

## 📊 Monitoring & Logs

### Docker Compose

```bash
# ดู logs ทุก services
docker-compose logs -f

# ดู logs เฉพาะ backend
docker-compose logs -f backend

# ดู logs 100 บรรทัดล่าสุด
docker-compose logs --tail=100 backend
```

### Railway

```bash
railway logs --tail=100
```

### Render

- ไปที่ service dashboard → "Logs" tab

### Google Cloud Run

```bash
gcloud run services logs read stock-management-api --limit=100
```

---

## 🔐 Security Checklist

- [ ] เปลี่ยน `JWT_SECRET` เป็น random string ที่แข็งแรง
- [ ] ใช้ strong password สำหรับ database
- [ ] ตั้งค่า CORS ให้ specific domain (ไม่ใช้ `*`)
- [ ] ปิด Swagger docs ใน production (ถ้าไม่จำเป็น)
- [ ] เปิด HTTPS/TLS สำหรับ production
- [ ] ใช้ environment variables สำหรับ secrets (ไม่ hardcode)
- [ ] Limit rate limiting สำหรับ API endpoints
- [ ] Enable database backup
- [ ] Monitor logs และ metrics

---

## 📚 คำสั่งที่มีประโยชน์

```bash
# Build production image
npm run docker:build:prod

# Start all services
npm run docker:up

# Start development mode
npm run docker:up:dev

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Rebuild containers
npm run docker:rebuild

# Database migrations
npm run migration:run
npm run migration:revert
npm run migration:show

# Health check
curl http://localhost:3000/health

# API docs
open http://localhost:3000/docs
```

---

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ logs: `docker logs -f stock-management-api`
2. ตรวจสอบ health endpoint: `curl http://localhost:3000/health`
3. ดู API docs: `http://localhost:3000/docs`
4. ตรวจสอบ environment variables: `docker exec stock-management-api env`

---

**สร้างโดย**: Stock Management Development Team
**อัพเดทล่าสุด**: {{ today }}
**เวอร์ชัน**: 1.0.0
