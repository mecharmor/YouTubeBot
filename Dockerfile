# Build stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .env.sample ./.env.sample

# Install production dependencies only
RUN npm install --production

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "build/index.js"] 