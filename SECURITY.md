# 🔒 Security Advisory

## ⚠️ CRITICAL: Exposed Credentials Rotation Required

### Background
This codebase previously contained hardcoded credentials in version control. These credentials have been removed, but if they were production keys, they **must be rotated immediately**.

### Action Items

#### 1. LINE API Credentials
If the following credentials were production keys:
- `LINE_CHANNEL_ID: 2006746784`
- `LINE_CHANNEL_SECRET: e673f3def0fecc4eeb43aad4460381fa`
- `LINE_LIFF_ID: 2006746784-e1y9NRqn`

**Actions Required:**
1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Navigate to your channel settings
3. **Rotate the Channel Secret immediately**
4. Update all deployed applications with the new credentials
5. Update your `.env` file with the new credentials

#### 2. Database Credentials
The following database credentials were previously hardcoded:
- Host: `mysql.railway.internal`
- Username: `root`
- Password: `yowDL0snjFWZrTDPvTJgvhjnqNeNUIUZ`
- Database: `railway`

**Actions Required:**
1. Change the database password in Railway dashboard
2. Update the `DATABASE_URL` environment variable in Railway
3. Redeploy the application

#### 3. JWT Secret
**Actions Required:**
1. Generate a strong JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Set the `JWT_SECRET` environment variable
3. Restart the application

### Default Admin Account

A default admin account is created during database migration:
- **Username:** `admin`
- **Email:** `admin@isuzustock.com`
- **Password:** `Admin@123456`

**⚠️ IMPORTANT: Change this password immediately after first login!**

### Environment Variables Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all required values in `.env`

3. **Never commit `.env` file to version control**

### Security Best Practices

1. ✅ All credentials are now stored in environment variables
2. ✅ Passwords are hashed using bcrypt (10 rounds)
3. ✅ Database connection fails fast if credentials are missing
4. ✅ JWT tokens expire after 24 hours
5. ✅ User status is checked on every login

### Reporting Security Issues

If you discover a security vulnerability, please email: security@isuzustock.com

**Do not** create a public GitHub issue for security vulnerabilities.

---

Last Updated: 2025-10-26
