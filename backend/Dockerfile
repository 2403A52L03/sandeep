# =============================================================================
# SMART AGRICULTURE AND CROP MONITORING DASHBOARD - BACKEND DOCKERFILE
# Project No. 60 | SR University | Academic Year 2026-2027
# Multi-stage lightweight Node.js 20 Alpine Image
# =============================================================================

# --- Stage 1: Build & Dependencies ---
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install dumb-init for proper PID 1 signal forwarding
RUN apk add --no-cache dumb-init

# Create non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Adjust permissions
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]

