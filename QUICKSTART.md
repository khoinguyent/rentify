# 🚀 Rentify - Quick Start Guide

Welcome to Rentify! This guide will help you get started quickly.

## 📋 What's Been Created

### ✅ Complete Monorepo Structure
```
rentify/
├── apps/
│   ├── web/          # Next.js 14 frontend (App Router, TailwindCSS, shadcn/ui)
│   └── api/          # NestJS backend (REST API with Swagger docs)
├── packages/
│   ├── db/           # Prisma schema with complete property management models
│   ├── types/        # Shared TypeScript types & Zod schemas
│   └── utils/        # Shared utilities (date, string, money formatting)
├── docker-compose.yml
├── Makefile
└── env.example
```

### ✅ Features Implemented

**Database (Prisma + PostgreSQL)**
- ✅ User management with roles (Admin, Landlord, Tenant, Agent)
- ✅ Landlord & Tenant profiles
- ✅ Property management
- ✅ Unit management
- ✅ Lease contracts
- ✅ Payment tracking
- ✅ Maintenance requests
- ✅ Amenities system

**Backend API (NestJS)**
- ✅ JWT authentication
- ✅ User registration & login
- ✅ Properties CRUD
- ✅ Units CRUD
- ✅ Leases CRUD
- ✅ Swagger API documentation at `/api/docs`
- ✅ Role-based access control

**Frontend (Next.js 14)**
- ✅ Modern landing page
- ✅ NextAuth.js integration
- ✅ shadcn/ui components
- ✅ TailwindCSS styling
- ✅ TypeScript throughout

**DevOps**
- ✅ Docker Compose for local development
- ✅ Multi-stage Dockerfiles for production
- ✅ Hot-reload in development
- ✅ Turborepo for optimized builds

## 🏃 Quick Start (3 Options)

### Option 1: Using Make (Recommended)

```bash
# 1. Copy environment file
cp env.example .env

# 2. Complete setup (installs deps, pushes schema, seeds DB)
make setup

# 3. Start development
make dev
```

### Option 2: Using Docker

```bash
# 1. Copy environment file
cp env.example .env

# 2. Start all services (Postgres, API, Web)
docker-compose up
```

### Option 3: Manual Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file
cp env.example .env

# 3. Start PostgreSQL
docker-compose up -d postgres

# 4. Push Prisma schema
pnpm db:push

# 5. (Optional) Seed database
pnpm --filter @rentify/db db:seed

# 6. Start development servers
pnpm dev
```

## 🌐 Access Your Applications

After starting the services:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Docs (Swagger)**: http://localhost:3001/api/docs
- **Prisma Studio**: Run `pnpm db:studio`

## 👤 Test Accounts (After Seeding)

```
Admin:
Email: admin@rentify.com
Password: admin123

Landlord:
Email: landlord@rentify.com
Password: landlord123

Tenant:
Email: tenant@rentify.com
Password: tenant123
```

## 📚 Key Commands

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm lint             # Lint all code

# Database
pnpm db:push          # Push schema to database
pnpm db:migrate       # Create and run migration
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database with test data

# Docker
make docker-up        # Start Docker containers
make docker-down      # Stop Docker containers
make docker-logs      # View logs

# Cleanup
make clean            # Remove node_modules and build artifacts
```

## 🏗️ Project Architecture

### Database Schema

**Core Models:**
- `User` - Base user with authentication
- `LandlordProfile` - Landlord-specific data
- `TenantProfile` - Tenant-specific data
- `Property` - Real estate properties
- `Unit` - Individual rental units
- `LeaseContract` - Rental agreements
- `Payment` - Rent payments
- `MaintenanceRequest` - Service requests
- `Amenity` - Property features

**Key Relationships:**
- One User → One Profile (Landlord OR Tenant)
- One Landlord → Many Properties
- One Property → Many Units
- One Lease → One Unit + One Tenant + One Landlord
- One Lease → Many Payments

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

**Users:**
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID

**Properties:**
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PATCH /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

**Units:**
- `GET /api/units` - List all units
- `POST /api/units` - Create unit
- `GET /api/units/:id` - Get unit details
- `PATCH /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit

**Leases:**
- `GET /api/leases` - List all leases
- `POST /api/leases` - Create lease
- `GET /api/leases/:id` - Get lease details
- `PATCH /api/leases/:id` - Update lease
- `DELETE /api/leases/:id` - Delete lease

## 🔐 Environment Variables

Key variables to configure in `.env`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rentify?schema=public"

# Authentication
NEXTAUTH_SECRET="change-this-to-a-random-string-min-32-chars"
JWT_SECRET="change-this-to-a-random-string"

# API
API_PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 🔑 Generate Secure Secrets for Production

**IMPORTANT:** Before deploying to production, generate strong random secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Security Notes:**
- `JWT_SECRET` - Set once, keep secure, only change if compromised
- `JWT_EXPIRATION="7d"` - Tokens expire after 7 days (not the secret!)
- Never commit secrets to Git
- Use environment variable management in production (AWS Secrets Manager, etc.)
- See `docs/JWT_SECURITY.md` for detailed security guidelines

## 📦 Shared Packages

### @rentify/db
Prisma client and database access layer used by both frontend and backend.

### @rentify/types
Shared TypeScript types and Zod validation schemas:
- Auth schemas (login, register)
- User schemas
- Property schemas
- Lease schemas

### @rentify/utils
Utility functions:
- `formatDate()`, `formatCurrency()`, `formatMoney()`
- `capitalize()`, `slugify()`, `truncate()`
- Date calculations for leases
- Money calculations (pro-rated rent, late fees)

## 🚢 Deployment

### Production Build

```bash
# Build for production
pnpm build

# Build Docker images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Run production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Recommended Platforms

- **Frontend (Next.js)**: Vercel, Netlify
- **Backend (NestJS)**: Railway, Fly.io, AWS ECS
- **Database**: Supabase, Railway, AWS RDS

## 🧪 Next Steps

1. **Customize the frontend**: Update components in `apps/web/src/`
2. **Add new API endpoints**: Create modules in `apps/api/src/`
3. **Extend the database**: Modify `packages/db/schema.prisma`
4. **Add authentication pages**: Create login/register pages
5. **Build dashboard**: Create landlord and tenant dashboards
6. **Add payment integration**: Integrate Stripe or similar
7. **File uploads**: Add support for property images
8. **Email notifications**: Set up email service

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 🆘 Troubleshooting

**Port already in use:**
```bash
# Change ports in docker-compose.yml or .env
```

**Database connection issues:**
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check if it's running
docker-compose ps
```

**Prisma client not found:**
```bash
# Generate Prisma client
pnpm db:generate
```

**Hot reload not working:**
```bash
# Restart the specific service
pnpm --filter @rentify/web dev
# or
pnpm --filter @rentify/api dev
```

---

**🎉 You're all set! Happy coding!**

