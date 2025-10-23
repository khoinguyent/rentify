# ========== STAGE 1: BUILDER ==========
FROM node:18-bullseye-slim AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Setup pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /repo

# Copy lockfiles first for caching
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Copy schema files before install to avoid postinstall errors
COPY packages/db/schema.prisma ./packages/db/

# Install all workspace deps
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the repo
COPY . .

# Generate Prisma client (using repo schema)
RUN pnpm --filter @rentify/db exec prisma generate

# Build the API
RUN pnpm --filter @rentify/api build

# ========== STAGE 2: RUNTIME ==========
FROM node:18-bullseye-slim AS runtime

# Install system dependencies
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY --from=builder /repo/apps/api/package.json ./package.json
COPY --from=builder /repo/packages/db/schema.prisma ./schema.prisma

# Copy all production node_modules from builder (this includes all dependencies)
COPY --from=builder /repo/node_modules ./node_modules

# Copy workspace packages
COPY --from=builder /repo/packages ./packages

# Copy built application
COPY --from=builder /repo/apps/api/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]

# ========== STAGE 3: DEVELOPMENT (for local development) ==========
FROM builder AS development

WORKDIR /repo/apps/api
EXPOSE 3001

CMD ["pnpm", "dev"]