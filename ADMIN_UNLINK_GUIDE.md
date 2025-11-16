# 🔧 Admin Setup & LINE Account Unlink Guide

## Problem
LINE account `U838fe39f00d4a0f1a80f791abaa2b24a` is already linked to staff `ISU001`, causing 409 Conflict errors when trying to link again.

## Solution: Use Admin API to Unlink

---

## Step 1: Create Admin User on Production Database

### Option A: Using Railway MySQL Console (Recommended)

1. Go to Railway Dashboard → MySQL Service → Data tab
2. Run this SQL:

```sql
-- Create admin user
INSERT INTO users (username, password, email, role, created_at, updated_at)
VALUES (
  'admin',
  '$2b$10$YourHashedPasswordHere',  -- See below for hash generation
  'admin@isuzustock.local',
  'admin',
  NOW(),
  NOW()
);
```

**Generate bcrypt hash for password:**
```bash
# On your local machine
node -e "console.log(require('bcrypt').hashSync('your-secure-password', 10))"
```

Copy the hash and replace `$2b$10$YourHashedPasswordHere` above.

### Option B: Using create-admin Script (if Railway CLI available)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
```

2. Link to your project:
```bash
cd /home/user/isuzustock-management
railway link
```

3. Get production database credentials:
```bash
railway variables
```

4. Set environment variables and run script:
```bash
# Set production DB credentials
export DB_HOST=<railway-mysql-host>
export DB_PORT=<railway-mysql-port>
export DB_USERNAME=<railway-mysql-user>
export DB_PASSWORD=<railway-mysql-pass>
export DB_DATABASE=<railway-mysql-database>

# Set admin credentials
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=Admin@1234!  # Use a secure password
export ADMIN_EMAIL=admin@isuzustock.local

# Run the script
npm run create:admin
```

---

## Step 2: Get Admin JWT Token

Use the admin credentials to login and get a JWT token:

```bash
curl -X POST https://isuzustock-management-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@1234!"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@isuzustock.local",
    "role": "admin"
  }
}
```

**Save the `access_token`** - you'll need it for the next step.

---

## Step 3: Unlink the LINE Account

Use the admin token to unlink the LINE account:

```bash
curl -X DELETE https://isuzustock-management-production.up.railway.app/api/line-integration/unlink/U838fe39f00d4a0f1a80f791abaa2b24a \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Replace `YOUR_ACCESS_TOKEN_HERE` with the token from Step 2.

**Expected Response:**
```json
{
  "message": "LINE account unlinked successfully"
}
```

---

## Step 4: Verify Unlink (Optional)

Check that the LINE account is no longer linked:

```bash
curl -X POST https://isuzustock-management-production.up.railway.app/api/line-integration/check \
  -H "Content-Type: application/json" \
  -d '{
    "lineUserId": "U838fe39f00d4a0f1a80f791abaa2b24a"
  }'
```

**Expected Response:**
```json
{
  "isRegistered": false,
  "message": "LINE account not registered"
}
```

---

## Step 5: Test Re-linking

Now try linking again through the LIFF app:

1. Open LIFF app: `https://testdrive-liff-app-production.up.railway.app`
2. Enter staff code: `ISU001` (without trailing spaces)
3. Should link successfully without 409 errors

---

## Quick Command Summary

```bash
# 1. Generate password hash (local)
node -e "console.log(require('bcrypt').hashSync('Admin@1234!', 10))"

# 2. Login to get token
curl -X POST https://isuzustock-management-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@1234!"}'

# 3. Unlink LINE account
curl -X DELETE https://isuzustock-management-production.up.railway.app/api/line-integration/unlink/U838fe39f00d4a0f1a80f791abaa2b24a \
  -H "Authorization: Bearer <TOKEN_FROM_STEP_2>"

# 4. Verify unlink
curl -X POST https://isuzustock-management-production.up.railway.app/api/line-integration/check \
  -H "Content-Type: application/json" \
  -d '{"lineUserId":"U838fe39f00d4a0f1a80f791abaa2b24a"}'
```

---

## Troubleshooting

### Issue: "Invalid credentials"
- Check username is exactly `admin` (no spaces)
- Verify password matches what you set
- Ensure bcrypt hash was generated correctly

### Issue: "Unauthorized" when unlinking
- Check that you included the `Authorization: Bearer <token>` header
- Verify token hasn't expired (tokens expire after 1 day by default)
- Re-login to get a fresh token

### Issue: "LINE account not found"
- The account might already be unlinked
- Verify the LINE user ID is correct: `U838fe39f00d4a0f1a80f791abaa2b24a`
- Check `line_users` table in production database

---

## Security Notes

1. **Keep admin credentials secure** - don't commit them to git
2. **Use strong passwords** - at least 12 characters with special chars
3. **Rotate admin password** after using it for sensitive operations
4. **JWT tokens expire** - you'll need to login again after expiration
5. **Don't share tokens** - they grant full admin access

---

## Alternative: Direct Database Method

If you can't use the API, you can unlink directly via Railway MySQL console:

```sql
-- Check current link
SELECT * FROM line_users WHERE line_user_id = 'U838fe39f00d4a0f1a80f791abaa2b24a';

-- Unlink the account
DELETE FROM line_users WHERE line_user_id = 'U838fe39f00d4a0f1a80f791abaa2b24a';

-- Verify deletion
SELECT * FROM line_users WHERE line_user_id = 'U838fe39f00d4a0f1a80f791abaa2b24a';
-- Should return: Empty set
```

---

## Next Steps After Unlinking

1. Test LIFF linking flow with staff codes:
   - ISU001
   - ISU002
   - ISU003

2. Verify all brand-scoped endpoints work:
   - GET /api/isuzu/stock
   - GET /api/isuzu/test-drives
   - POST /api/isuzu/test-drives

3. Monitor Railway logs for any remaining errors

---

## Files Modified

- ✅ `scripts/create-admin.ts` - Admin user creation script
- ✅ `package.json` - Added `create:admin` script
- ✅ `ADMIN_UNLINK_GUIDE.md` - This guide
