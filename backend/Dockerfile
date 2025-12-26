FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Create entrypoint script
RUN cat > /app/entrypoint.sh << 'SCRIPT'
#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
npx prisma migrate deploy || true

echo "Seeding database with initial data..."
node scripts/seed.js || true

echo "Starting application..."
exec node src/index.js
SCRIPT

RUN chmod +x /app/entrypoint.sh

# Start application
CMD ["/app/entrypoint.sh"]
