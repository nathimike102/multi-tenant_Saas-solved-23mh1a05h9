FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]
