# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for layer caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code after dependencies
COPY . .

# Build the project
RUN pnpm run build

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["pnpm", "start"]
