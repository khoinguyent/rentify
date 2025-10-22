# Frequently Asked Questions (FAQ)

## 🔐 Security & Authentication

### Q: Do I need to change JWT_SECRET every 7 days in production?

**A: No!** This is a common misunderstanding. Here's what "7d" actually means:

**JWT_EXPIRATION = "7d"**
- ✅ This means each JWT token **expires after 7 days**
- ✅ Users need to re-authenticate after their token expires
- ✅ Old tokens automatically become invalid after 7 days

**JWT_SECRET**
- ✅ This is the **cryptographic key** used to sign tokens
- ✅ Set it **once** with a strong random value
- ❌ **Never** rotate on a schedule
- ⚠️ Only change if it's been **compromised**

**Summary:**
```bash
JWT_SECRET="abc123..."      # Set once, stays the same
JWT_EXPIRATION="7d"         # Each token expires after 7 days
```

When you change JWT_SECRET, ALL existing tokens become invalid and all users must re-login.

**See:** `docs/JWT_SECURITY.md` for detailed security guidelines

---

### Q: How do I generate a secure JWT_SECRET?

**A:** Use one of these methods:

```bash
# Method 1: Node.js (Recommended)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: OpenSSL
openssl rand -base64 64

# Method 3: Online (less secure)
# https://generate-secret.vercel.app/64
```

Your secret should be:
- ✅ At least 256 bits (32+ characters)
- ✅ Completely random
- ✅ Stored securely (environment variables, secret managers)
- ✅ Never committed to Git

---

### Q: What JWT expiration time should I use?

**A:** It depends on your security requirements:

| Duration | Use Case | Security | User Experience |
|----------|----------|----------|-----------------|
| **15m - 1h** | Banking, healthcare | ⭐⭐⭐⭐⭐ | ⭐⭐ (frequent login) |
| **1d - 7d** | SaaS, e-commerce | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ (current setup) |
| **30d+** | Low-sensitivity apps | ⭐⭐ | ⭐⭐⭐⭐⭐ |

**Recommendation:** Start with 7 days (current), implement refresh tokens for better security.

---

### Q: When SHOULD I rotate the JWT_SECRET?

**A:** Only in these situations:

1. ✅ **Security breach** - Secret has been exposed
2. ✅ **Compliance requirement** - Your industry mandates it
3. ✅ **Employee departure** - Someone with access left
4. ✅ **Annual security audit** - Part of security policy

**Impact of rotation:**
- All users must re-authenticate
- All active sessions end
- Plan for user communication

---

## 🗄️ Database

### Q: How do I run database migrations?

**A:**

```bash
# Create a new migration
pnpm db:migrate

# Push schema changes without migration (development)
pnpm db:push

# Generate Prisma client after schema changes
pnpm db:generate
```

### Q: How do I reset the database?

**A:**

```bash
# Delete database and recreate
docker-compose down -v
docker-compose up -d postgres
pnpm db:push
pnpm --filter @rentify/db db:seed
```

### Q: How do I add a new table/model?

**A:**

1. Edit `packages/db/schema.prisma`
2. Add your new model
3. Run migration:
   ```bash
   pnpm db:migrate
   ```
4. Update your seed file if needed: `packages/db/seed.ts`

---

## 🚀 Deployment

### Q: How do I deploy to production?

**A:**

**Option 1: Docker (Any platform)**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

**Option 2: Separate platforms**
- Frontend → Vercel / Netlify
- Backend → Railway / Fly.io / AWS
- Database → Supabase / Railway / AWS RDS

**Important:**
1. Generate production secrets (see above)
2. Set environment variables on your platform
3. Run migrations on production database
4. Enable HTTPS/SSL

### Q: Do I need to install dependencies in production?

**A:** 

The Dockerfiles handle this automatically. If deploying without Docker:

```bash
# Install only production dependencies
pnpm install --prod --frozen-lockfile
```

---

## 📦 Monorepo

### Q: How do I add a new package?

**A:**

```bash
# Create package directory
mkdir -p packages/new-package

# Add package.json
cat > packages/new-package/package.json << EOF
{
  "name": "@rentify/new-package",
  "version": "1.0.0",
  "private": true,
  "main": "./index.ts"
}
EOF

# Use in apps
# In app's package.json:
{
  "dependencies": {
    "@rentify/new-package": "workspace:*"
  }
}
```

### Q: How do I run commands for specific apps?

**A:**

```bash
# Run dev for specific app
pnpm --filter @rentify/web dev
pnpm --filter @rentify/api dev

# Build specific app
pnpm --filter @rentify/web build

# Run any script
pnpm --filter @rentify/db db:studio
```

### Q: Why use pnpm instead of npm/yarn?

**A:**

- ✅ **Faster** - More efficient disk usage
- ✅ **Workspace support** - Better monorepo handling
- ✅ **Strict** - Prevents phantom dependencies
- ✅ **Compatible** - Works with all npm packages

---

## 🐳 Docker

### Q: How do I rebuild Docker images?

**A:**

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build web
docker-compose build api

# Force rebuild (no cache)
docker-compose build --no-cache
```

### Q: How do I view logs?

**A:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100
```

### Q: Containers won't start - port already in use?

**A:**

```bash
# Option 1: Stop conflicting service
# Find what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill the process
kill -9 <PID>

# Option 2: Change ports in docker-compose.yml
services:
  web:
    ports:
      - "3002:3000"  # Changed from 3000:3000
```

---

## 🔧 Development

### Q: Hot reload isn't working?

**A:**

```bash
# With Docker - ensure volumes are correct in docker-compose.yml
# Without Docker - restart the specific service
pnpm --filter @rentify/web dev
```

### Q: Prisma client not found?

**A:**

```bash
# Generate Prisma client
pnpm db:generate

# If in Docker, rebuild
docker-compose build
```

### Q: TypeScript errors in shared packages?

**A:**

```bash
# Ensure all packages are built
pnpm build

# Check type errors
pnpm type-check
```

---

## 🎯 Best Practices

### Q: Should I use Docker for local development?

**A:**

**Use Docker if:**
- ✅ You want environment parity with production
- ✅ Team members have different OS
- ✅ You want to isolate dependencies

**Skip Docker if:**
- ✅ You prefer faster startup times
- ✅ You're comfortable with local PostgreSQL
- ✅ You want easier debugging

**Recommended:** Use Docker for PostgreSQL only:
```bash
docker-compose up -d postgres
pnpm dev  # Run apps locally
```

### Q: How should I structure my .env files?

**A:**

```
.env                 # Local development (gitignored)
.env.example         # Template (committed to Git)
.env.local           # Local overrides (gitignored)
.env.production      # Production values (NEVER commit!)
```

### Q: How do I add a new API endpoint?

**A:**

1. Create DTO in module's `dto` folder
2. Add method to service
3. Add route to controller
4. Test in Swagger docs

Example:
```typescript
// properties.controller.ts
@Get('search')
async search(@Query('q') query: string) {
  return this.propertiesService.search(query);
}
```

---

## 🆘 Troubleshooting

### Q: "Cannot find module @rentify/db"

**A:**

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Restart dev server
pnpm dev
```

### Q: Database connection refused

**A:**

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check DATABASE_URL in .env
# Should be: postgresql://postgres:postgres@localhost:5432/rentify
```

### Q: "Port 3000 already in use"

**A:**

```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or change the port
PORT=3002 pnpm --filter @rentify/web dev
```

---

## 📚 Additional Resources

- **JWT Security**: `docs/JWT_SECURITY.md`
- **Quick Start**: `QUICKSTART.md`
- **Contributing**: `CONTRIBUTING.md`
- **Main README**: `README.md`

---

**Need more help?** Open an issue or check the documentation!

