# Build context should be repo root
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Build argument for API URL (defaults to relative path for reverse proxy)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Copy root workspace files and all workspaces (Bun requires all declared workspaces to exist)
COPY package.json bun.lock* ./
COPY packages ./packages
COPY apps ./apps
COPY backend/package.json ./backend/package.json

# Install dependencies
RUN bun install --frozen-lockfile

# Build the application
WORKDIR /app/apps/admin
RUN bun run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Port 80 is used internally - accessed via main nginx reverse proxy in production
# EXPOSE removed to prevent Coolify from prompting for domain configuration

CMD ["nginx", "-g", "daemon off;"]
