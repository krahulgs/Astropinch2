#!/bin/bash
set -e

echo "Running pre-start checks..."

# Check if static directory exists
mkdir -p static/avatars

# Run database migrations (or create tables) with retries
echo "Initializing/Migrating database..."
for i in {1..20}; do
  if python migrate_db.py; then
    echo "Database initialized/migrated successfully."
    break
  else
    echo "Database not ready yet (Attempt $i/20). Waiting 5s..."
    sleep 5
  fi
done

echo "Checks complete. Starting Uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT
