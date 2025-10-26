# ==========================
#  STAGE 1 — BUILDER
# ==========================
FROM node:18-alpine AS builder
WORKDIR /app

# Install system deps for Prisma and pnpm
RUN apk add --no-cache openssl
RUN npm install -g pnpm

# Copy manifests (for caching)
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Copy full monorepo
COPY . .

# 🧩 Validate and install deps
RUN pnpm install --no-frozen-lockfile

# Generate Prisma Client in db package
RUN pnpm --filter @rentify/db exec prisma generate

# Build NestJS API
RUN pnpm --filter @rentify/api build

# Sanity check
RUN ls -la apps/api/dist || (echo "❌ dist folder missing after build" && exit 1)
RUN find /app -name ".prisma" -type d || echo "⚠️ Finding .prisma directory location"


# ==========================
#  STAGE 2 — RUNTIME
# ==========================
FROM node:18-alpine AS runtime
WORKDIR /app

# System dependencies + pnpm + Prisma CLI
RUN apk add --no-cache openssl
RUN npm install -g pnpm prisma

# Copy workspace manifests
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY . .

# 🧱 Deploy production dependencies (skip postinstall scripts)
RUN pnpm deploy --filter @rentify/api --prod --ignore-scripts /app/standalone

WORKDIR /app/standalone

# ✅ Copy built dist, Prisma schema, and Prisma engine binaries
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/db/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma ./node_modules/.prisma

# Verify everything critical
RUN ls -la dist || (echo '❌ dist missing in runtime' && exit 1)
RUN ls -la node_modules/@prisma/client/ || (echo '❌ Prisma client JS missing' && exit 1)
RUN ls -la node_modules/.prisma/client || (echo '❌ Prisma engine binaries missing' && exit 1)

EXPOSE 3001
CMD ["node", "dist/main.js"]