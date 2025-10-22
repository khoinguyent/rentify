# 🧾 Billing & Invoice System - Complete Guide

## Overview

The Rentify billing system supports:
- ✅ **Flexible billing cycles**: Monthly (1), Quarterly (3), Semi-Annual (6), Annual (12)
- ✅ **Fixed fees**: Parking, service fees, management fees
- ✅ **Variable fees**: Electricity, water, gas (based on usage)
- ✅ **Discounts**: Percentage-based or fixed amount
- ✅ **Automatic invoice generation** with detailed line items
- ✅ **Usage tracking** for utility consumption

---

## 📊 Database Models

### LeaseContract (Enhanced)

```prisma
model LeaseContract {
  // ... existing fields ...
  billingDay         Int            @default(1)     // 1-31
  billingCycleMonths Int            @default(1)     // 1, 3, 6, or 12
  discountType       DiscountType?                  // PERCENT or FIXED
  discountValue      Decimal?                       // 10% or $100
  fees               LeaseFee[]
  usageRecords       UsageRecord[]
  invoices           Invoice[]
}
```

### LeaseFee

```prisma
model LeaseFee {
  name        String    // "Electricity", "Parking", etc.
  type        FeeType   // FIXED or VARIABLE
  amount      Decimal?  // For FIXED fees
  unitPrice   Decimal?  // For VARIABLE fees (e.g., $0.15/kWh)
  billingUnit String?   // "kWh", "m³", etc.
}
```

### UsageRecord

```prisma
model UsageRecord {
  feeId       String
  periodMonth DateTime  // First day of month
  usageValue  Decimal   // 150 kWh, 20 m³
  totalAmount Decimal   // usageValue * unitPrice
}
```

### Invoice

```prisma
model Invoice {
  invoiceNumber   String   @unique
  periodStart     DateTime
  periodEnd       DateTime
  subtotal        Decimal  // Before discount
  discountAmount  Decimal
  totalAmount     Decimal  // After discount
  status          InvoiceStatus
  items           InvoiceItem[]
}
```

---

## 🔧 API Endpoints

### Lease Fees Management

#### Create a Fee

```http
POST /leases/{leaseId}/fees
```

**Fixed Fee Example:**
```json
{
  "name": "Parking",
  "type": "FIXED",
  "amount": 150,
  "isMandatory": false
}
```

**Variable Fee Example:**
```json
{
  "name": "Electricity",
  "type": "VARIABLE",
  "unitPrice": 0.15,
  "billingUnit": "kWh",
  "isMandatory": true
}
```

#### Get All Fees for a Lease

```http
GET /leases/{leaseId}/fees
```

#### Update a Fee

```http
PATCH /fees/{feeId}
```

```json
{
  "isActive": false
}
```

#### Delete a Fee

```http
DELETE /fees/{feeId}
```

---

### Usage Tracking

#### Record Usage (Single)

```http
POST /leases/{leaseId}/usage
```

```json
{
  "feeId": "clxxx123",
  "usageValue": 150.5,
  "periodMonth": "2025-10-01",
  "notes": "Meter reading: 12345"
}
```

#### Record Usage (Bulk)

```http
POST /leases/{leaseId}/usage/bulk
```

```json
{
  "usageData": [
    {
      "feeId": "electricity-fee-id",
      "usageValue": 150.5,
      "periodMonth": "2025-10-01"
    },
    {
      "feeId": "water-fee-id",
      "usageValue": 25.3,
      "periodMonth": "2025-10-01"
    }
  ]
}
```

#### Get Usage Records

```http
GET /leases/{leaseId}/usage?periodStart=2025-01-01&periodEnd=2025-03-31
```

#### Get Usage Summary

```http
GET /leases/{leaseId}/usage/summary?periodStart=2025-01-01&periodEnd=2025-03-31
```

**Response:**
```json
[
  {
    "fee": {
      "id": "...",
      "name": "Electricity",
      "unitPrice": 0.15
    },
    "totalUsage": "450.5",
    "totalAmount": "67.575",
    "records": [...]
  }
]
```

---

### Invoice Generation

#### Generate Invoice for a Lease

```http
POST /leases/{leaseId}/invoices/generate
```

**Automatic Period:**
```json
{}
```

**Custom Period:**
```json
{
  "periodStart": "2025-01-01",
  "periodEnd": "2025-03-31"
}
```

#### Generate All Invoices Due Today

```http
POST /billing/generate-today
```

This endpoint checks all active leases where:
- Today is the billing day
- Enough months have passed since last invoice
- Generates invoices automatically

#### Get Invoices for a Lease

```http
GET /leases/{leaseId}/invoices
```

#### Get Invoice by ID

```http
GET /invoices/{invoiceId}
```

**Response:**
```json
{
  "id": "...",
  "invoiceNumber": "INV-202510-0001",
  "periodStart": "2025-10-01",
  "periodEnd": "2025-10-31",
  "subtotal": "3310.00",
  "discountAmount": "165.50",
  "totalAmount": "3144.50",
  "status": "UNPAID",
  "items": [
    {
      "type": "RENT",
      "name": "Rent",
      "amount": "3000.00"
    },
    {
      "type": "VARIABLE_FEE",
      "name": "Electricity",
      "quantity": "150",
      "unitPrice": "0.15",
      "amount": "22.50"
    },
    {
      "type": "FIXED_FEE",
      "name": "Parking",
      "amount": "150.00"
    },
    {
      "type": "DISCOUNT",
      "name": "Discount (5%)",
      "amount": "-165.50"
    }
  ]
}
```

#### Mark Invoice as Paid

```http
PATCH /invoices/{invoiceId}/pay
```

```json
{
  "paidAmount": 3144.50,
  "paymentMethod": "bank_transfer"
}
```

#### Update Overdue Invoices

```http
POST /billing/update-overdue
```

Marks all unpaid invoices past their due date as OVERDUE.

---

### Statistics

#### Get Billing Statistics

```http
GET /leases/{leaseId}/billing-stats
```

**Response:**
```json
{
  "totalInvoices": 12,
  "totalBilled": 37734.00,
  "totalPaid": 31445.00,
  "unpaidInvoices": 1,
  "overdueInvoices": 0,
  "paidInvoices": 11
}
```

---

## 💼 Usage Examples

### Example 1: Monthly Lease with Variable Fees

```typescript
// 1. Create lease with monthly billing
const lease = await createLease({
  propertyId: "prop-123",
  unitId: "unit-456",
  tenantId: "tenant-789",
  rentAmount: 2000,
  billingDay: 1,
  billingCycleMonths: 1,  // Monthly
  discountType: "PERCENT",
  discountValue: 5,  // 5% discount
  // ... other fields
});

// 2. Add variable fee (electricity)
await createFee({
  leaseId: lease.id,
  name: "Electricity",
  type: "VARIABLE",
  unitPrice: 0.15,  // $0.15 per kWh
  billingUnit: "kWh"
});

// 3. Record monthly usage
await recordUsage({
  leaseId: lease.id,
  feeId: electricityFee.id,
  usageValue: 200,  // 200 kWh
  periodMonth: "2025-10-01"
});

// 4. Generate invoice on billing day
const invoice = await generateInvoice(lease.id);
// Invoice will include:
// - Rent: $2000
// - Electricity: 200 kWh × $0.15 = $30
// - Subtotal: $2030
// - Discount (5%): -$101.50
// - Total: $1928.50
```

### Example 2: Quarterly Lease with Fixed Fees

```typescript
// 1. Create lease with quarterly billing
const lease = await createLease({
  rentAmount: 3000,
  billingDay: 1,
  billingCycleMonths: 3,  // Quarterly
  discountType: "FIXED",
  discountValue: 500,  // $500 off per quarter
  // ... other fields
});

// 2. Add fixed fees
await createFee({
  leaseId: lease.id,
  name: "Parking",
  type: "FIXED",
  amount: 150  // $150 per month
});

await createFee({
  leaseId: lease.id,
  name: "Service Fee",
  type: "FIXED",
  amount: 100  // $100 per month
});

// 3. Generate quarterly invoice
const invoice = await generateInvoice(lease.id);
// Invoice will include:
// - Rent: $3000 × 3 months = $9000
// - Parking: $150 × 3 = $450
// - Service Fee: $100 × 3 = $300
// - Subtotal: $9750
// - Discount: -$500
// - Total: $9250
```

---

## 🔄 Invoice Generation Logic

### Automatic Period Calculation

1. **First Invoice**:
   - `periodStart` = lease.startDate
   - `periodEnd` = startDate + billingCycleMonths - 1 month (end of last month)

2. **Subsequent Invoices**:
   - `periodStart` = lastInvoice.periodEnd + 1 day
   - `periodEnd` = periodStart + billingCycleMonths - 1 month

3. **Invoice Items**:
   - **Rent**: `rentAmount × billingCycleMonths`
   - **Fixed Fees**: `feeAmount × billingCycleMonths`
   - **Variable Fees**: Sum of usage records in period
   - **Discount**: Applied to subtotal
     - PERCENT: `subtotal × (discountValue / 100)`
     - FIXED: `discountValue`

---

## 📅 Scheduled Jobs

### Daily Invoice Generation

Run this as a cron job:

```typescript
// Every day at 1:00 AM
POST /billing/generate-today
```

This will:
- Find all active leases where today is the billing day
- Check if enough months have passed since last invoice
- Generate invoices automatically

### Overdue Invoice Updates

Run this as a cron job:

```typescript
// Every day at 2:00 AM
POST /billing/update-overdue
```

This marks unpaid invoices past their due date as OVERDUE.

---

## 🧪 Testing with Seed Data

After running the seed:

```bash
pnpm --filter @rentify/db db:seed
```

You'll have:
- ✅ 2 leases (1 monthly, 1 quarterly)
- ✅ 5 lease fees (electricity, water, parking, service fees)
- ✅ 4 usage records
- ✅ 1 paid invoice with full breakdown

**Test the system:**

```bash
# Get lease fees
curl http://localhost:3001/api/leases/{leaseId}/fees

# Record usage
curl -X POST http://localhost:3001/api/leases/{leaseId}/usage \
  -H "Content-Type: application/json" \
  -d '{
    "feeId": "electricity-fee-id",
    "usageValue": 180,
    "periodMonth": "2025-10-01"
  }'

# Generate invoice
curl -X POST http://localhost:3001/api/leases/{leaseId}/invoices/generate

# Get invoices
curl http://localhost:3001/api/leases/{leaseId}/invoices
```

---

## 🎯 Common Scenarios

### Scenario 1: Add Utility Fees to Existing Lease

```http
POST /leases/{leaseId}/fees
```

```json
{
  "name": "Gas",
  "type": "VARIABLE",
  "unitPrice": 1.2,
  "billingUnit": "m³",
  "isMandatory": true
}
```

### Scenario 2: Record Multiple Utilities at Once

```http
POST /leases/{leaseId}/usage/bulk
```

```json
{
  "usageData": [
    { "feeId": "elec-id", "usageValue": 150, "periodMonth": "2025-10-01" },
    { "feeId": "water-id", "usageValue": 20, "periodMonth": "2025-10-01" },
    { "feeId": "gas-id", "usageValue": 15, "periodMonth": "2025-10-01" }
  ]
}
```

### Scenario 3: Process Monthly Invoices for All Tenants

```typescript
// Cron job (1st of every month)
const result = await fetch('http://localhost:3001/api/billing/generate-today', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' }
});

console.log(`Generated ${result.generated} invoices`);
```

### Scenario 4: Handle Payment

```http
PATCH /invoices/{invoiceId}/pay
```

```json
{
  "paidAmount": 3144.50,
  "paymentMethod": "credit_card",
  "paidAt": "2025-10-05T10:30:00Z"
}
```

---

## 🔒 Business Rules

1. **Discount Validation**:
   - Percentage discounts: 0-100%
   - Fixed discounts: Cannot exceed subtotal

2. **Billing Cycles**:
   - Only 1, 3, 6, or 12 months allowed
   - Invoice covers `billingCycleMonths` worth of fees

3. **Usage Records**:
   - Unique per lease + fee + month
   - Update existing record if duplicate

4. **Invoice Generation**:
   - Prevents duplicate invoices for same period
   - Only generates for ACTIVE leases
   - Respects lease end date

---

## 📝 Notes

- Invoice numbers are auto-generated: `INV-YYYYMM-XXXX`
- All monetary values use `Decimal` for precision
- Usage records normalized to start of month
- Variable fees require usage records for invoice generation
- Fixed fees are multiplied by billing cycle months

---

**Happy Billing! 🎉**

