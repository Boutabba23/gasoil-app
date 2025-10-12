# Stage 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code and build the app
COPY . .
RUN pnpm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the built app from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx config (you’ll create this below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000 (Nginx will serve here)
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
