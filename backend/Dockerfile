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
RUN printf '#!/bin/sh\nset -e\n\necho "Waiting for database to be ready..."\nsleep 5\n\necho "Running database migrations..."\nnpx prisma migrate deploy || true\n\necho "Seeding database with initial data..."\nnode scripts/seed.js || true\n\necho "Starting application..."\nexec node src/index.js\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Start application
CMD ["/app/entrypoint.sh"]
