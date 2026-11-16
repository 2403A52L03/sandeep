# =============================================================================
# SMART AGRICULTURE AND CROP MONITORING DASHBOARD - FRONTEND DOCKERFILE
# Project No. 60 | SR University | Academic Year 2026-2027
# Multi-stage: Node.js 20 build -> Nginx Alpine production runtime
# =============================================================================

# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Stage 2: Serve with Production Nginx ---
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

