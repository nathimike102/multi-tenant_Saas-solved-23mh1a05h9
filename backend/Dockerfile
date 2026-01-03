FROM node:18-slim

WORKDIR /app

# Install OpenSSL and other required dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

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

# Create entrypoint script (without seed to avoid segfault)
RUN printf '#!/bin/sh\nset -e\n\necho "Waiting for database to be ready..."\nsleep 5\n\necho "Running database migrations..."\nnpx prisma migrate deploy || true\n\necho "Starting application..."\nexec node src/server.js\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Start application
CMD ["/app/entrypoint.sh"]
