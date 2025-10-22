# Base stage
FROM node:18-bullseye-slim AS base
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile --ignore-scripts; \
    else pnpm install --ignore-scripts; fi

# Ensure Prisma Client and engines are generated for the container
RUN rm -rf /app/packages/db/generated

# Development stage
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["pnpm", "dev"]

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
WORKDIR /app/packages/db
RUN pnpm db:generate

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# Production stage
FROM base AS production
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/api
EXPOSE 3001

CMD ["node", "dist/main.js"]

