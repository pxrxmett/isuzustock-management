# 🚀 Setup Guide - Isuzu Stock Management Backend

## ⚠️ IMPORTANT SECURITY NOTICE

**Before deploying to production, please read [SECURITY.md](./SECURITY.md) carefully!**

This codebase had hardcoded credentials that have been removed. If you're updating from an older version, you **must** rotate all credentials immediately.

---

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

---

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd isuzustock-management
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` file with your actual values:

#### Generate JWT Secret (Required)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and set it as `JWT_SECRET` in your `.env` file.

#### Database Configuration

**Option 1: Using DATABASE_URL (Recommended for Railway/Heroku)**
```env
DATABASE_URL=mysql://username:password@host:port/database
```

**Option 2: Using Individual Variables (For local development)**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=stock_management
```

#### LINE Integration (Optional)

If you're using LINE authentication:
1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create a channel (if you haven't already)
3. Get your credentials:
   ```env
   LINE_CHANNEL_ID=your_actual_channel_id
   LINE_CHANNEL_SECRET=your_actual_channel_secret
   LINE_LIFF_ID=your_actual_liff_id
   ```

### 4. Database Setup

```bash
# Create database (if not exists)
mysql -u root -p
CREATE DATABASE stock_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

# Run migrations
npm run migration:run
```

This will:
- Create all necessary tables
- Set up indexes
- **Create a default admin account**

**Default Admin Credentials:**
- Username: `admin`
- Password: `Admin@123456`

⚠️ **Change this password immediately after first login!**

---

## 🏃 Running the Application

### Development Mode
```bash
npm run start:dev
```

The API will be available at:
- API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/docs
- Health Check: http://localhost:3000/health

### Production Mode
```bash
# Build
npm run build

# Start
npm run start:prod
```

---

## 🔐 First Login

After starting the server, test the authentication:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123456"
  }'
```

You should receive a response with an `access_token`.

**⚠️ IMPORTANT: Change the default admin password immediately!**

---

## 🐳 Docker Setup (Alternative)

```bash
# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📝 API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:3000/docs

All endpoints are documented with:
- Request/Response schemas
- Authentication requirements
- Example payloads

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🔒 Security Checklist

Before deploying to production, ensure:

- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] Default admin password has been changed
- [ ] Database credentials are not hardcoded
- [ ] All environment variables are set in your hosting platform
- [ ] `.env` file is in `.gitignore` (should be already)
- [ ] LINE credentials are rotated if they were exposed
- [ ] Database password is rotated if it was exposed
- [ ] HTTPS is enabled on your domain
- [ ] CORS origins are properly configured

---

## 🚨 Troubleshooting

### "Database credentials missing" Error

Make sure you've set either:
- `DATABASE_URL`, OR
- All of: `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`

### "JWT_SECRET is not set" Error

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add it to your `.env` file:
```env
JWT_SECRET=<generated-secret>
```

### Migration Errors

```bash
# Check migration status
npm run migration:show

# Revert last migration
npm run migration:revert

# Run migrations again
npm run migration:run
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [LINE Developers](https://developers.line.biz/)

---

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f` or console output
2. Review [SECURITY.md](./SECURITY.md) for security-related issues
3. Check environment variables are correctly set

---

**Last Updated:** 2025-10-26
