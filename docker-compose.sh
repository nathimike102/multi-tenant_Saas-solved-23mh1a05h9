#!/bin/bash
# Simple docker-compose wrapper using docker commands

cd "/home/ghost/Desktop/Partnr tasks/SaaS"

echo "🐳 Starting Nathi SaaS Docker services..."

# Create network
docker network create saas-network 2>/dev/null || true

# Create volume
docker volume create db_data 2>/dev/null || true

# Start database
echo "📦 Starting PostgreSQL database..."
docker run -d \
  --name saas_database \
  --network saas-network \
  -e POSTGRES_DB=saas_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres_password_123 \
  -p 5432:5432 \
  -v db_data:/var/lib/postgresql/data \
  postgres:15-alpine

sleep 5

# Build and start backend
echo "🔨 Building and starting backend..."
docker build -t saas_backend:latest ./backend/
docker run -d \
  --name saas_backend \
  --network saas-network \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://postgres:postgres_password_123@saas_database:5432/saas_db \
  -e JWT_SECRET=saas_jwt_secret_key_min_32_chars_long_2025 \
  -e FRONTEND_URL=http://localhost:3000 \
  -e PORT=5000 \
  -p 5000:5000 \
  saas_backend:latest

# Build and start frontend
echo "🎨 Building and starting frontend..."
docker build -t saas_frontend:latest ./frontend/
docker run -d \
  --name saas_frontend \
  --network saas-network \
  -e VITE_API_URL=http://localhost:5000 \
  -p 3000:3000 \
  saas_frontend:latest

echo ""
echo "✅ Services starting..."
echo ""
echo "Available services:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:5000"
echo "  Database:  localhost:5432"
echo ""
echo "Checking service status..."
sleep 10
docker ps -a
