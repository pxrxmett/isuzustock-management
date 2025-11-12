#!/bin/bash

# ===================================================================
# Script to cleanup orphaned staff references in test_drives
# ===================================================================

set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Check required environment variables
if [ -z "$DB_HOST" ] || [ -z "$DB_DATABASE" ] || [ -z "$DB_USERNAME" ]; then
    echo "❌ Error: Missing required database environment variables"
    echo "Required: DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD"
    exit 1
fi

echo "🔧 Cleanup Orphaned Staff References in test_drives"
echo "=================================================="
echo "Database: $DB_DATABASE"
echo "Host: $DB_HOST"
echo ""
echo "⚠️  WARNING: This will modify your database!"
echo "   It will set invalid staff references to NULL"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🚀 Running cleanup script..."
echo ""

# Run the cleanup SQL script
mysql -h "$DB_HOST" \
      -P "${DB_PORT:-3306}" \
      -u "$DB_USERNAME" \
      -p"$DB_PASSWORD" \
      "$DB_DATABASE" \
      < scripts/cleanup-test-drives-staff.sql

echo ""
echo "✅ Cleanup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review the output above to see what was changed"
echo "2. Run: npm run build"
echo "3. Run: npm run migration:run (or start your application)"
