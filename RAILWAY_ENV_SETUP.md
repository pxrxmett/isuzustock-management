# 🚂 Railway Environment Variables Setup

## 📋 Required Environment Variables

Copy these to your Railway service's **Variables** tab:

### 1️⃣ Application Settings

```env
NODE_ENV=production
PORT=3000
```

**Note**: Railway automatically provides `PORT`, but we set it to 3000 for consistency.

---

### 2️⃣ Database Configuration (from Railway MySQL Service)

**IMPORTANT**: These should auto-populate when you add a MySQL service to your Railway project.

```env
# Use Railway's reference syntax to link MySQL service
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USERNAME=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_DATABASE=stock_management
```

**Alternative**: If using external MySQL or manual configuration:
```env
DB_HOST=your-mysql-host.railway.app
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_secure_password_here
DB_DATABASE=stock_management
```

---

### 3️⃣ Security - JWT Secret (REQUIRED)

```env
JWT_SECRET=your_random_32_character_secret_here
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output: `a7f5b2c3d4e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0`

⚠️ **CRITICAL**: Never use default values like `change-this-secret` in production!

---

### 4️⃣ LINE Integration (REQUIRED for LINE features)

Get these from [LINE Developers Console](https://developers.line.biz/console/):

```env
LINE_CHANNEL_ID=2006746784
LINE_CHANNEL_SECRET=your_line_channel_secret_from_console
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_LIFF_ID=2006746784-e1y9NRqn
```

**How to get LINE credentials:**
1. Go to https://developers.line.biz/console/
2. Select your provider
3. Create/select your channel
4. Get **Channel ID** from "Basic settings"
5. Get **Channel Secret** from "Basic settings"
6. Issue **Channel Access Token** from "Messaging API" tab
7. Get **LIFF ID** from "LIFF" tab

---

### 5️⃣ CORS Configuration (Frontend URLs)

```env
FRONTEND_URL=https://testdrive-liff-app-production.up.railway.app
ADMIN_URL=https://your-admin-dashboard.railway.app
```

**Note**: Update these with your actual frontend URLs after deploying the frontend.

---

## 📝 Complete Environment Variables Template

Copy this entire block to Railway:

```env
# Application
NODE_ENV=production
PORT=3000

# Database (Auto-populated by Railway MySQL service)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USERNAME=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_DATABASE=stock_management

# Security (CHANGE THIS!)
JWT_SECRET=GENERATE_YOUR_OWN_32_CHAR_SECRET_HERE

# LINE Integration (Get from LINE Console)
LINE_CHANNEL_ID=2006746784
LINE_CHANNEL_SECRET=YOUR_LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN=YOUR_LINE_ACCESS_TOKEN
LINE_LIFF_ID=2006746784-e1y9NRqn

# Frontend URLs
FRONTEND_URL=https://testdrive-liff-app-production.up.railway.app
ADMIN_URL=https://your-admin-dashboard.railway.app
```

---

## 🚀 Railway Deployment Steps

### Step 1: Add MySQL Database

1. In your Railway project, click **+ New**
2. Select **Database** → **MySQL**
3. Railway will create a MySQL service and generate environment variables

### Step 2: Add Environment Variables

1. Click on your **Backend service**
2. Go to **Variables** tab
3. Click **+ New Variable**
4. Add each variable from the template above

**Using Railway MySQL References:**
- Railway allows you to reference other services using `${{ServiceName.VARIABLE}}`
- Example: `${{MySQL.MYSQL_HOST}}` automatically gets the MySQL host

### Step 3: Deploy

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "fix: configure for Railway production deployment"
   git push origin main
   ```

2. Railway will automatically detect changes and deploy

### Step 4: Run Migrations (After First Deploy)

In Railway dashboard:
1. Go to your backend service
2. Click **...** → **Shell**
3. Run migrations:
   ```bash
   npm run migration:run
   ```

---

## ✅ Validation Checklist

After setting environment variables, verify:

- [ ] **NODE_ENV** is set to `production`
- [ ] **DB_HOST** references Railway MySQL service
- [ ] **JWT_SECRET** is at least 32 characters and unique
- [ ] **LINE credentials** are correct (test with LINE login)
- [ ] **FRONTEND_URL** points to your deployed frontend
- [ ] Application starts without errors (check logs)
- [ ] Database connection succeeds (check logs for "✅ Environment variables validated")
- [ ] Health check endpoint works: `https://your-app.railway.app/health`

---

## 🔍 Troubleshooting

### Error: "JWT_SECRET environment variable is required"

**Solution**: Add JWT_SECRET to Railway environment variables.
```bash
# Generate one:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Error: "Database configuration is incomplete"

**Solution**: Ensure MySQL service is running and variables are linked:
```env
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USERNAME=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
```

### Error: "Cannot connect to database"

**Checklist**:
1. MySQL service is running (green status in Railway)
2. Variables are correctly linked
3. DB_DATABASE is set to `stock_management`
4. Check logs for actual connection error

### App shows "development" mode logs

**Solution**: Verify NODE_ENV is set to `production` in Railway variables.

### CORS errors from frontend

**Solution**: Add frontend URL to FRONTEND_URL variable:
```env
FRONTEND_URL=https://your-frontend.railway.app
```

---

## 📊 Monitoring

### Check Deployment Logs

Railway Dashboard → Your Service → **Deployments** → Click on deployment → **View Logs**

Look for these success messages:
```
✅ Environment variables validated
   Database: railway-mysql-host:3306/stock_management
   Environment: production
   Port: 3000

🚀 Application is running in PRODUCTION mode
📍 Server: http://localhost:3000
❤️  Health Check: http://localhost:3000/health
```

### Test Endpoints

```bash
# Health check
curl https://your-app.railway.app/health

# API docs
curl https://your-app.railway.app/docs

# Root endpoint
curl https://your-app.railway.app/
```

---

## 🔐 Security Best Practices

1. ✅ **Never commit .env files** - Already configured in .gitignore
2. ✅ **Use strong JWT_SECRET** - Minimum 32 characters, random
3. ✅ **Rotate secrets periodically** - Update JWT_SECRET every 90 days
4. ✅ **Limit CORS origins** - Only allow specific frontend URLs
5. ✅ **Use SSL for database** - Already configured in database.config.ts
6. ✅ **Monitor logs** - Check for failed auth attempts

---

## 📞 Support

If you encounter issues:

1. Check Railway logs: `railway logs --tail`
2. Verify environment variables are set correctly
3. Test database connectivity
4. Check application logs for error messages

---

**Last Updated**: 2025-01-06
**Railway Version**: v2
**Node Version**: 20.x
