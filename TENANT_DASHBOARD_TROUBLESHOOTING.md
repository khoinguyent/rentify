# Tenant Dashboard Troubleshooting Guide

## Current Issue
The tenant dashboard is showing 404 errors for all API endpoints.

## What Was Created

### Frontend Components ✅
- `TenantSidebar.tsx` - Fully responsive sidebar with pastel teal theme
- `TenantKPICards` - Displays lease KPIs
- `MyLease` - Shows current lease info
- `UpcomingPayments` - Shows payment schedule

### Backend API ⚠️
- `TenantsController` - REST API for tenant data
- `TenantsService` - Business logic
- `TenantsModule` - Module configuration

### Hooks ✅
- `useTenantDashboard.ts` - Custom SWR hooks for fetching tenant data

## Current Problem

The API endpoints are returning 404 because:
1. The NestJS API server needs to be **restarted** to pick up the new `TenantsModule`
2. The routes are at `/api/tenants/:tenantId/lease` etc.
3. The frontend is calling `http://localhost:3001/api/tenants/{userId}/lease`

## Solution Steps

### 1. Restart API Server
```bash
# Kill current API server
pkill -f "nest.*start"

# Start API server
cd /Users/123khongbiet/Documents/rentify/apps/api
pnpm dev
```

Wait for the server to fully start (you should see "NestJS application started").

### 2. Verify Routes Are Loaded
```bash
curl "http://localhost:3001/api"
# Should return: {"status":"ok","message":"Rentify API is running"}

# Test tenant endpoint (will fail auth but should not be 404)
curl "http://localhost:3001/api/tenants/test/lease"
# If you get 401/403, the route works! If 404, route not loaded.
```

### 3. Test with Real Authentication
The tenant endpoints require JWT authentication. The frontend should:
- Get JWT token from NextAuth session
- Send as `Authorization: Bearer {token}` header
- This is already implemented in `useTenantDashboard.ts`

### 4. Check Database Data
Ensure the tenant user has an active lease:
```sql
SELECT * FROM tenant_profiles WHERE email = 'tenant@rentify.com';
SELECT * FROM lease_contracts WHERE status = 'ACTIVE';
```

## Expected Behavior

Once working, the tenant dashboard should:
- Display real lease data from database
- Show payment schedule
- Show invoice history
- Require JWT authentication
- Redirect tenants from `/dashboard` to `/tenant/dashboard`

## Manual Testing

1. Login as tenant: `tenant@rentify.com` / `tenant123`
2. Should redirect to `/tenant/dashboard`
3. Should see data or "No data" messages (not errors)
4. API should be called with JWT token
5. Should see lease info if tenant has active lease

## If Still Not Working

1. Check API logs for errors
2. Verify database has tenant with active lease
3. Check JWT token generation in NextAuth
4. Ensure API server is running on port 3001
5. Check CORS settings allow `localhost:3000`

