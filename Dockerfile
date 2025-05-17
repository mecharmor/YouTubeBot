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

# Install Chrome and dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .env.sample ./.env.sample

# Install production dependencies only
RUN npm install --production

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Set essential environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create data directory and set permissions
RUN mkdir -p /app/data /app/build/src && \
    chown -R node:node /app/data /app/build/src && \
    chmod -R 755 /app/data /app/build/src

# Create startup script
RUN echo '#!/bin/sh\n\
# Copy all files from data directory if they exist\n\
if [ -d /app/data ] && [ "$(ls -A /app/data)" ]; then\n\
  echo "Copying files from persistent storage..."\n\
  cp -r /app/data/* /app/build/src/\n\
  echo "Files copied successfully"\n\
elif [ -f /app/.env.sample ]; then\n\
  cp /app/.env.sample /app/build/src/.env\n\
  echo "Created .env from sample file"\n\
fi\n\
\n\
# Start the application as non-root user\n\
exec node build/src/main.js' > /app/start.sh && \
    chmod +x /app/start.sh && \
    chown node:node /app/start.sh

# Switch to non-root user
USER node

# Command to run the application
CMD ["/app/start.sh"]