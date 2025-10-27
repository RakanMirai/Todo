#!/bin/bash
set -e

echo "=========================================="
echo "Starting Full-Stack Todo Application"
echo "=========================================="
echo "Frontend: Port 8080 (Nginx)"
echo "Backend API: Port 8000 (Uvicorn) -> Proxied to /api"
echo "=========================================="

# Start nginx in the background
echo "Starting Nginx (Frontend)..."
nginx

# Wait a moment for nginx to start
sleep 2

# Check if nginx started successfully
if ! pgrep nginx > /dev/null; then
    echo "ERROR: Nginx failed to start!"
    exit 1
fi

echo "✓ Nginx started successfully"
echo "Starting Uvicorn (Backend API)..."
echo ""

# Start uvicorn in the foreground
exec uvicorn main:app \
    --host 127.0.0.1 \
    --port 8000 \
    --log-level info \
    --access-log
