#!/bin/bash
set -e

echo "Running pre-start checks..."

# Check if static directory exists
mkdir -p static/avatars

# Run database migrations (or create tables)
python -c "from main import app; import models; from database import engine; models.Base.metadata.create_all(bind=engine)"

echo "Checks complete. Starting Uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT
