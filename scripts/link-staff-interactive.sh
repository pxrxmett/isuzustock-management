#!/bin/bash

# ==============================================================================
# Interactive Staff Linking Script
# Description: เชื่อมโยง LINE User ID กับ Staff แบบ interactive
# Usage: ./scripts/link-staff-interactive.sh
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
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

print_header() {
    echo -e "${CYAN}$1${NC}"
}

print_question() {
    echo -e "${MAGENTA}❓ $1${NC}"
}

# ==============================================================================
# Main Script
# ==============================================================================

clear
echo ""
echo "=========================================="
echo "  🔗 Staff - LINE Account Linking Tool"
echo "=========================================="
echo ""

# Step 1: Get Staff Code
print_header "STEP 1: ข้อมูลพนักงาน"
echo ""
print_question "กรุณากรอกรหัสพนักงาน (Staff Code):"
read -p "> " STAFF_CODE

if [ -z "$STAFF_CODE" ]; then
    print_error "กรุณากรอกรหัสพนักงาน!"
    exit 1
fi

echo ""

# Step 2: Get LINE User ID
print_header "STEP 2: LINE User ID"
echo ""
print_info "วิธีหา LINE User ID:"
print_info "1. ให้พนักงานเปิด LIFF App"
print_info "2. กด F12 (Developer Tools) → Console"
print_info "3. พิมพ์: liff.getProfile().then(p => console.log(p.userId))"
print_info "4. Copy ค่าที่ได้มาวางด้านล่าง"
echo ""
print_question "กรุณากรอก LINE User ID:"
read -p "> " LINE_USER_ID

if [ -z "$LINE_USER_ID" ]; then
    print_error "กรุณากรอก LINE User ID!"
    exit 1
fi

# Validate LINE User ID format
if [[ ! $LINE_USER_ID =~ ^U[a-f0-9]{32}$ ]]; then
    print_warning "LINE User ID อาจจะไม่ถูกต้อง (ควรขึ้นต้นด้วย U และตามด้วย 32 ตัวอักษร)"
    echo ""
    print_question "ต้องการดำเนินการต่อหรือไม่? (y/n):"
    read -p "> " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        print_info "ยกเลิกการดำเนินการ"
        exit 0
    fi
fi

echo ""

# Step 3: Get LINE Display Name
print_header "STEP 3: ชื่อที่แสดงใน LINE (optional)"
echo ""
print_question "กรุณากรอกชื่อที่แสดงใน LINE (กด Enter เพื่อข้าม):"
read -p "> " LINE_DISPLAY_NAME

echo ""

# Step 4: Confirm
print_header "STEP 4: ยืนยันข้อมูล"
echo ""
echo "┌─────────────────────────────────────────┐"
echo "│  ข้อมูลที่จะทำการเชื่อมโยง              │"
echo "├─────────────────────────────────────────┤"
echo "│  Staff Code     : $STAFF_CODE"
echo "│  LINE User ID   : $LINE_USER_ID"
echo "│  Display Name   : ${LINE_DISPLAY_NAME:-[ไม่ระบุ]}"
echo "└─────────────────────────────────────────┘"
echo ""
print_question "ยืนยันการเชื่อมโยง? (y/n):"
read -p "> " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    print_info "ยกเลิกการดำเนินการ"
    exit 0
fi

echo ""

# Step 5: Generate SQL
print_header "STEP 5: กำลังสร้าง SQL Script..."
echo ""

SQL_FILE="/tmp/link-staff-${STAFF_CODE}.sql"

cat > "$SQL_FILE" <<EOF
-- Link Staff: $STAFF_CODE
-- Generated: $(date)

-- Step 1: Check if staff exists
SELECT '🔍 Checking staff...' AS step;
SELECT
  staff_code,
  CONCAT(first_name, ' ', last_name) AS full_name,
  department,
  status,
  line_user_id AS current_line_user_id
FROM staffs
WHERE staff_code = '$STAFF_CODE';

-- Step 2: Check if LINE User ID is already used
SELECT '🔍 Checking LINE User ID...' AS step;
SELECT
  staff_code,
  CONCAT(first_name, ' ', last_name) AS full_name
FROM staffs
WHERE line_user_id = '$LINE_USER_ID';

-- Step 3: Link LINE to Staff
SELECT '✅ Linking LINE to Staff...' AS step;
UPDATE staffs
SET
  line_user_id = '$LINE_USER_ID',
  line_display_name = ${LINE_DISPLAY_NAME:+'$LINE_DISPLAY_NAME'},
  line_last_login_at = NOW(),
  is_line_linked = 1
WHERE staff_code = '$STAFF_CODE'
  AND status = 'active';

SELECT ROW_COUNT() AS rows_updated;

-- Step 4: Verify
SELECT '🎉 Verification...' AS step;
SELECT
  staff_code,
  CONCAT(first_name, ' ', last_name) AS full_name,
  line_user_id,
  line_display_name,
  CASE WHEN is_line_linked = 1 THEN '✅ Linked' ELSE '❌ Not Linked' END AS status,
  line_last_login_at
FROM staffs
WHERE staff_code = '$STAFF_CODE';
EOF

print_success "SQL Script ถูกสร้างที่: $SQL_FILE"
echo ""

# Step 6: Execute options
print_header "STEP 6: เลือกวิธีดำเนินการ"
echo ""
echo "1) แสดง SQL Script (Copy ไปรันเอง)"
echo "2) รัน SQL ผ่าน Railway CLI (ต้อง login railway ก่อน)"
echo "3) รัน SQL ผ่าน MySQL Client (ต้อง config connection)"
echo "4) ยกเลิก"
echo ""
print_question "เลือกตัวเลือก (1-4):"
read -p "> " OPTION

echo ""

case $OPTION in
    1)
        print_info "SQL Script:"
        echo ""
        cat "$SQL_FILE"
        echo ""
        print_info "Copy SQL ด้านบนไปรันใน MySQL Client หรือ Railway Console"
        ;;
    2)
        print_info "กำลังรัน SQL ผ่าน Railway CLI..."
        if command -v railway &> /dev/null; then
            railway run mysql < "$SQL_FILE"
            print_success "เสร็จสิ้น!"
        else
            print_error "ไม่พบ Railway CLI"
            print_info "ติดตั้ง Railway CLI: npm i -g @railway/cli"
        fi
        ;;
    3)
        print_question "กรุณากรอก MySQL Host:"
        read -p "> " DB_HOST
        print_question "กรุณากรอก MySQL Port (default: 3306):"
        read -p "> " DB_PORT
        DB_PORT=${DB_PORT:-3306}
        print_question "กรุณากรอก MySQL Username:"
        read -p "> " DB_USER
        print_question "กรุณากรอก MySQL Password:"
        read -sp "> " DB_PASS
        echo ""
        print_question "กรุณากรอก Database Name:"
        read -p "> " DB_NAME

        print_info "กำลังรัน SQL..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"
        print_success "เสร็จสิ้น!"
        ;;
    4)
        print_info "ยกเลิกการดำเนินการ"
        exit 0
        ;;
    *)
        print_error "ตัวเลือกไม่ถูกต้อง"
        exit 1
        ;;
esac

echo ""
print_success "=========================================="
print_success "  🎉 เชื่อมโยง Staff กับ LINE สำเร็จ!"
print_success "=========================================="
echo ""
print_info "พนักงานสามารถ Login ผ่าน LINE ได้แล้ว"
print_info "ให้พนักงาน refresh LIFF App และ login ใหม่"
echo ""

# Cleanup
rm -f "$SQL_FILE"
