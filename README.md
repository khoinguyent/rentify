# Rentify - Property & Leasing Management SaaS

A production-ready, modular monorepo for property and leasing management.

## 🏗️ Architecture

This is a **Turborepo monorepo** with the following structure:

```
rentify/
├── apps/
│   ├── web/          # Next.js 14 frontend (App Router)
│   └── api/          # NestJS backend API
├── packages/
│   ├── db/           # Prisma schema + client
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
└── docker-compose.yml
```

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: NestJS (modular architecture)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Monorepo**: Turborepo + pnpm
- **DevOps**: Docker + docker-compose

## 📦 Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose

## 🛠️ Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### 3. Start PostgreSQL

```bash
docker-compose up -d postgres
```

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Start development servers

```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📜 Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps
- `pnpm db:push` - Push Prisma schema to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:generate` - Generate Prisma client

## 🐳 Docker

### Development

```bash
docker-compose up
```

### Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 📁 Packages

### @rentify/db

Shared Prisma schema and database client.

### @rentify/types

Shared TypeScript types and Zod schemas.

### @rentify/utils

Shared utility functions (date, string, money formatting).

## 🔐 Authentication

Uses NextAuth.js with support for:
- Credentials (email/password)
- Google OAuth (configurable)
- Apple Sign In (configurable)

## 📊 Database Models

- User, LandlordProfile, TenantProfile
- Property, Unit, Amenity
- LeaseContract

See `packages/db/schema.prisma` for full schema.

## 🚢 Deployment

This monorepo is ready for deployment to:
- Vercel (Next.js frontend)
- Railway/Fly.io (NestJS backend)
- Any Docker-compatible platform

## 📄 License

MIT

