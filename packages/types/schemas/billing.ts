import { z } from 'zod';

// Lease Fee Schemas
export const leaseFeeSchema = z.object({
  id: z.string(),
  leaseId: z.string(),
  name: z.string(),
  type: z.enum(['FIXED', 'VARIABLE']),
  amount: z.number().or(z.string()).optional(),
  unitPrice: z.number().or(z.string()).optional(),
  billingUnit: z.string().optional(),
  isMandatory: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const createLeaseFeeSchema = z.object({
  leaseId: z.string(),
  name: z.string().min(1, 'Fee name is required'),
  type: z.enum(['FIXED', 'VARIABLE']),
  amount: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  billingUnit: z.string().optional(),
  isMandatory: z.boolean().default(true),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.type === 'FIXED') return data.amount !== undefined;
    if (data.type === 'VARIABLE') return data.unitPrice !== undefined && data.billingUnit !== undefined;
    return true;
  },
  {
    message: 'FIXED fees require amount, VARIABLE fees require unitPrice and billingUnit',
  }
);

export const updateLeaseFeeSchema = createLeaseFeeSchema.partial().omit({ leaseId: true });

// Usage Record Schemas
export const usageRecordSchema = z.object({
  id: z.string(),
  leaseId: z.string(),
  feeId: z.string(),
  periodMonth: z.date().or(z.string()),
  usageValue: z.number().or(z.string()),
  totalAmount: z.number().or(z.string()),
  notes: z.string().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const createUsageRecordSchema = z.object({
  leaseId: z.string(),
  feeId: z.string(),
  periodMonth: z.string().or(z.date()),
  usageValue: z.number().positive('Usage value must be positive'),
  notes: z.string().optional(),
});

// Invoice Schemas
export const invoiceSchema = z.object({
  id: z.string(),
  leaseId: z.string(),
  invoiceNumber: z.string(),
  periodStart: z.date().or(z.string()),
  periodEnd: z.date().or(z.string()),
  issueDate: z.date().or(z.string()),
  dueDate: z.date().or(z.string()),
  subtotal: z.number().or(z.string()),
  discountAmount: z.number().or(z.string()),
  taxAmount: z.number().or(z.string()),
  totalAmount: z.number().or(z.string()),
  status: z.enum(['UNPAID', 'PAID', 'OVERDUE', 'CANCELLED']),
  paidAt: z.date().or(z.string()).optional(),
  paidAmount: z.number().or(z.string()).optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const invoiceItemSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  feeId: z.string().optional(),
  type: z.enum(['RENT', 'FIXED_FEE', 'VARIABLE_FEE', 'DISCOUNT']),
  name: z.string(),
  description: z.string().optional(),
  quantity: z.number().or(z.string()),
  unitPrice: z.number().or(z.string()),
  amount: z.number().or(z.string()),
  periodStart: z.date().or(z.string()).optional(),
  periodEnd: z.date().or(z.string()).optional(),
  createdAt: z.date().or(z.string()),
});

export const generateInvoiceSchema = z.object({
  leaseId: z.string(),
  periodStart: z.string().or(z.date()).optional(),
  periodEnd: z.string().or(z.date()).optional(),
});

export const payInvoiceSchema = z.object({
  paidAmount: z.number().positive('Payment amount must be positive'),
  paymentMethod: z.string().optional(),
  paidAt: z.string().or(z.date()).optional(),
});

// Enhanced Lease Contract Schema
export const enhancedLeaseContractSchema = z.object({
  billingDay: z.number().int().min(1).max(31).default(1),
  billingCycleMonths: z.enum([1, 3, 6, 12]).default(1),
  discountType: z.enum(['PERCENT', 'FIXED']).optional(),
  discountValue: z.number().positive().optional(),
});

// Export Types
export type LeaseFee = z.infer<typeof leaseFeeSchema>;
export type CreateLeaseFeeInput = z.infer<typeof createLeaseFeeSchema>;
export type UpdateLeaseFeeInput = z.infer<typeof updateLeaseFeeSchema>;

export type UsageRecord = z.infer<typeof usageRecordSchema>;
export type CreateUsageRecordInput = z.infer<typeof createUsageRecordSchema>;

export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
export type PayInvoiceInput = z.infer<typeof payInvoiceSchema>;

export type EnhancedLeaseContract = z.infer<typeof enhancedLeaseContractSchema>;

