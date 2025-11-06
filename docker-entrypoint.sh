#!/bin/sh
set -e

echo "================================"
echo "🚀 Starting Stock Management API"
echo "================================"

# Function to wait for database
wait_for_db() {
  echo "⏳ Waiting for database to be ready..."

  # Maximum wait time (seconds)
  MAX_WAIT=60
  WAIT_TIME=0

  # Wait for database to be available
  until node -e "
    const mysql = require('mysql2/promise');
    mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'stock_management'
    })
    .then(() => { console.log('✅ Database is ready!'); process.exit(0); })
    .catch(() => { process.exit(1); });
  " 2>/dev/null
  do
    if [ $WAIT_TIME -ge $MAX_WAIT ]; then
      echo "❌ Database is not available after ${MAX_WAIT} seconds"
      exit 1
    fi

    echo "⏳ Database not ready yet, waiting... (${WAIT_TIME}s/${MAX_WAIT}s)"
    sleep 2
    WAIT_TIME=$((WAIT_TIME + 2))
  done
}

# Function to run database migrations
run_migrations() {
  echo ""
  echo "📊 Running database migrations..."

  if npm run migration:run 2>&1; then
    echo "✅ Migrations completed successfully"
  else
    echo "⚠️  Migration warning (this is normal if no new migrations)"
  fi
}

# Main execution
echo "Environment: ${NODE_ENV:-development}"
echo "Database Host: ${DB_HOST:-localhost}"
echo "Database Name: ${DB_DATABASE:-stock_management}"
echo ""

# Wait for database (only if DB_HOST is set)
if [ -n "$DB_HOST" ]; then
  wait_for_db
fi

# Run migrations (optional, comment out if not needed)
# Uncomment the line below to auto-run migrations on startup
# run_migrations

echo ""
echo "================================"
echo "✅ Starting NestJS application..."
echo "================================"
echo ""

# Start the application
exec node dist/main
