# 📡 Rentify API Endpoints - Complete Reference

## Base URL
```
http://localhost:3001/api
```

All endpoints require JWT authentication except auth endpoints.
Add header: `Authorization: Bearer <token>`

---

## 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with credentials |

---

## 👥 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| GET | `/users/:id` | Get user by ID |

---

## 🏢 Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/properties` | Create property |
| GET | `/properties` | List all properties |
| GET | `/properties/:id` | Get property details |
| PATCH | `/properties/:id` | Update property |
| DELETE | `/properties/:id` | Delete property |

---

## 🏠 Units

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/units` | Create unit |
| GET | `/units` | List all units |
| GET | `/units/:id` | Get unit details |
| PATCH | `/units/:id` | Update unit |
| DELETE | `/units/:id` | Delete unit |

---

## 📝 Leases

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/leases` | Create lease contract |
| GET | `/leases` | List all leases |
| GET | `/leases/:id` | Get lease details |
| PATCH | `/leases/:id` | Update lease |
| DELETE | `/leases/:id` | Delete lease |

---

## 💰 Billing - Fees

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/leases/:leaseId/fees` | Add fee to lease |
| GET | `/leases/:leaseId/fees` | Get all fees for lease |
| PATCH | `/fees/:feeId` | Update fee |
| DELETE | `/fees/:feeId` | Delete fee |

### Example: Create Fixed Fee
```json
POST /leases/{leaseId}/fees
{
  "name": "Parking",
  "type": "FIXED",
  "amount": 150
}
```

### Example: Create Variable Fee
```json
POST /leases/{leaseId}/fees
{
  "name": "Electricity",
  "type": "VARIABLE",
  "unitPrice": 0.15,
  "billingUnit": "kWh"
}
```

---

## 📊 Billing - Usage Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/leases/:leaseId/usage` | Record single usage |
| POST | `/leases/:leaseId/usage/bulk` | Record multiple usages |
| GET | `/leases/:leaseId/usage` | Get usage records |
| GET | `/leases/:leaseId/usage/summary` | Get usage summary |
| DELETE | `/usage/:usageId` | Delete usage record |

### Example: Record Usage
```json
POST /leases/{leaseId}/usage
{
  "feeId": "fee-id",
  "usageValue": 150.5,
  "periodMonth": "2025-10-01",
  "notes": "Meter reading"
}
```

### Example: Bulk Usage
```json
POST /leases/{leaseId}/usage/bulk
{
  "usageData": [
    {
      "feeId": "electricity-id",
      "usageValue": 150,
      "periodMonth": "2025-10-01"
    },
    {
      "feeId": "water-id",
      "usageValue": 25,
      "periodMonth": "2025-10-01"
    }
  ]
}
```

---

## 🧾 Billing - Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/leases/:leaseId/invoices/generate` | Generate invoice |
| POST | `/billing/generate-today` | Generate all due invoices |
| GET | `/leases/:leaseId/invoices` | Get invoices for lease |
| GET | `/invoices/:invoiceId` | Get invoice by ID |
| PATCH | `/invoices/:invoiceId/pay` | Mark invoice as paid |
| POST | `/billing/update-overdue` | Update overdue statuses |
| GET | `/leases/:leaseId/billing-stats` | Get billing statistics |

### Example: Generate Invoice
```json
POST /leases/{leaseId}/invoices/generate
{
  "periodStart": "2025-10-01",
  "periodEnd": "2025-10-31"
}
```

### Example: Pay Invoice
```json
PATCH /invoices/{invoiceId}/pay
{
  "paidAmount": 3144.50,
  "paymentMethod": "bank_transfer"
}
```

---

## 🔍 Query Parameters

### Properties
- `?landlordId={id}` - Filter by landlord

### Units
- `?propertyId={id}` - Filter by property

### Leases
- `?status={status}` - Filter by status

### Usage
- `?periodStart={date}&periodEnd={date}` - Filter by period

---

## 📋 Response Format

### Success Response
```json
{
  "id": "clxxx123",
  "name": "Sample",
  "createdAt": "2025-10-22T..."
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## 🎯 Common Workflows

### 1. Create New Lease with Fees

```bash
# 1. Create lease
POST /leases
{
  "rentAmount": 2000,
  "billingCycleMonths": 1,
  "discountType": "PERCENT",
  "discountValue": 5,
  ...
}

# 2. Add electricity fee
POST /leases/{leaseId}/fees
{
  "name": "Electricity",
  "type": "VARIABLE",
  "unitPrice": 0.15,
  "billingUnit": "kWh"
}

# 3. Add parking fee
POST /leases/{leaseId}/fees
{
  "name": "Parking",
  "type": "FIXED",
  "amount": 150
}
```

### 2. Monthly Billing Process

```bash
# 1. Record usage for the month
POST /leases/{leaseId}/usage/bulk
{
  "usageData": [
    { "feeId": "elec-id", "usageValue": 200, "periodMonth": "2025-10-01" },
    { "feeId": "water-id", "usageValue": 30, "periodMonth": "2025-10-01" }
  ]
}

# 2. Generate invoice
POST /leases/{leaseId}/invoices/generate

# 3. Get invoice details
GET /invoices/{invoiceId}

# 4. Mark as paid when payment received
PATCH /invoices/{invoiceId}/pay
{
  "paidAmount": 3144.50,
  "paymentMethod": "bank_transfer"
}
```

### 3. Automated Daily Jobs

```bash
# Run as cron job every day at 1:00 AM
POST /billing/generate-today

# Run as cron job every day at 2:00 AM
POST /billing/update-overdue
```

---

## 📚 Additional Resources

- **Full Billing Guide**: See `docs/BILLING_SYSTEM.md`
- **Database Schema**: See `packages/db/schema.prisma`
- **Swagger Docs**: http://localhost:3001/api/docs

---

## 🔧 Testing

### Get Test Data
After seeding, you'll have sample leases, fees, and invoices.

```bash
# Seed database
pnpm --filter @rentify/db db:seed

# Get all leases
GET /leases

# Get lease fees
GET /leases/{leaseId}/fees

# Get invoices
GET /leases/{leaseId}/invoices
```

---

**Happy coding! 🚀**

