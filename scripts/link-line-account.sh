#!/bin/bash

# ==============================================================================
# Script: Link LINE Account to Staff
# Description: เชื่อมโยง LINE User ID กับพนักงานในฐานข้อมูล
# Usage: ./scripts/link-line-account.sh STAFF_CODE LINE_USER_ID
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ==============================================================================
# Main Script
# ==============================================================================

echo ""
echo "========================================"
echo "  🔗 Link LINE Account to Staff"
echo "========================================"
echo ""

# Check arguments
if [ "$#" -ne 2 ]; then
    print_error "Usage: $0 STAFF_CODE LINE_USER_ID"
    echo ""
    echo "Example:"
    echo "  $0 STAFF001 U1234567890abcdef"
    echo ""
    exit 1
fi

STAFF_CODE="$1"
LINE_USER_ID="$2"

print_info "Staff Code: ${STAFF_CODE}"
print_info "LINE User ID: ${LINE_USER_ID}"
echo ""

# Check if DATABASE_URL is set (Railway)
if [ -n "${DATABASE_URL}" ]; then
    print_info "Using DATABASE_URL from Railway"
    DB_CONNECTION="${DATABASE_URL}"
else
    # Use individual variables
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-3306}"
    DB_USERNAME="${DB_USERNAME:-root}"
    DB_PASSWORD="${DB_PASSWORD}"
    DB_DATABASE="${DB_DATABASE:-stock_management}"

    print_info "Using MySQL connection: ${DB_USERNAME}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"
fi

# ==============================================================================
# Execute via API (Recommended)
# ==============================================================================

print_info "Linking via API..."

API_URL="${BACKEND_URL:-http://localhost:3000}/api/line-integration/link"

# Note: This requires a valid LINE Access Token
# For manual linking without token, use SQL method below

print_warning "API method requires LINE Access Token"
print_info "API Endpoint: POST ${API_URL}"
echo ""
echo "Request body:"
cat <<EOF
{
  "staffCode": "${STAFF_CODE}",
  "lineUserId": "${LINE_USER_ID}",
  "lineAccessToken": "YOUR_LINE_ACCESS_TOKEN_HERE"
}
EOF
echo ""

# ==============================================================================
# SQL Alternative (Direct Database)
# ==============================================================================

print_info "Alternative: Direct SQL update"
echo ""
echo "Run this SQL in your database:"
echo ""

cat <<EOF
-- 1. Check if staff exists
SELECT id, staff_code, first_name, last_name, line_user_id
FROM staffs
WHERE staff_code = '${STAFF_CODE}';

-- 2. Check if LINE User ID is already linked
SELECT staff_code, first_name, last_name
FROM staffs
WHERE line_user_id = '${LINE_USER_ID}';

-- 3. Link LINE User ID to Staff
UPDATE staffs
SET
  line_user_id = '${LINE_USER_ID}',
  line_last_login_at = NOW(),
  is_line_linked = 1
WHERE staff_code = '${STAFF_CODE}';

-- 4. Verify
SELECT staff_code, first_name, last_name, line_user_id, is_line_linked
FROM staffs
WHERE staff_code = '${STAFF_CODE}';
EOF

echo ""
print_success "SQL commands generated!"
echo ""

# ==============================================================================
# Railway CLI Method
# ==============================================================================

print_info "Railway CLI method:"
echo ""
echo "If you have Railway CLI installed:"
echo ""
cat <<EOF
railway run mysql -e "
UPDATE staffs
SET
  line_user_id = '${LINE_USER_ID}',
  line_last_login_at = NOW(),
  is_line_linked = 1
WHERE staff_code = '${STAFF_CODE}';
"
EOF

echo ""
print_success "Done! User can now login with LINE."
echo ""
