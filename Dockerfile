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

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
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

# Set environment variables
ENV NODE_ENV=production
ENV LOG_LEVEL=info

# Pexels API configuration
# ENV PEXEL_API_KEY=""

# # Debug and logging
# ENV DEBUG=1

# # Video duration settings
# ENV DURATION_HOURS=0
# ENV DURATION_MINUTES=0
# ENV DURATION_SECONDS=60

# # Cache settings
# ENV DISABLE_CACHE_CLEANUP=0

# # Video upload settings
# ENV SHOULD_UPLOAD_NEW_VIDEO_FOR_EVERY_HOUR_IN_DURATION=0

# # Random duration settings
# ENV SHOULD_USE_RANDOM_DURATION=0
# ENV RANDOM_DURATION_MIN=0
# ENV RANDOM_DURATION_MAX=0

# Create data directory for persistent storage
RUN mkdir -p /app/data && chown -R node:node /app/data

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
# Ensure data directory exists and has correct permissions\n\
mkdir -p /app/data\n\
chown -R node:node /app/data\n\
\n\
# Start the application\n\
exec node build/src/main.js' > /app/start.sh && chmod +x /app/start.sh

# Command to run the application
CMD ["node", "build/src/main.js"]