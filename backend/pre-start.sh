#!/bin/bash
set -e

echo "Running pre-start checks..."

# Check if static directory exists
mkdir -p static/avatars

# Run database migrations (or create tables) with retries
echo "Initializing database..."
for i in {1..20}; do
  if python -c "from main import app; import models; from database import engine; models.Base.metadata.create_all(bind=engine)"; then
    echo "Database initialized successfully."
    break
  else
    echo "Database not ready yet (Attempt $i/10). Waiting 5s..."
    sleep 5
  fi
done

echo "Checks complete. Starting Uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT
