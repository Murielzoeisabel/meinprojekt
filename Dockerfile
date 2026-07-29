# Base image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and subpackage package files
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Install dependencies for both frontend and backend
RUN npm run install:all

# Copy all project files
COPY . .

# Build frontend and copy to backend/public
RUN npm run deploy:build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built backend and node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules

WORKDIR /app/backend

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node server.js"]
