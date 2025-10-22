import { z } from 'zod';

export const leaseContractSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  unitId: z.string(),
  landlordId: z.string(),
  tenantId: z.string(),
  startDate: z.date().or(z.string()),
  endDate: z.date().or(z.string()),
  rentAmount: z.number().or(z.string()),
  depositAmount: z.number().or(z.string()),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']),
  paymentDueDay: z.number().min(1).max(31),
  lateFeeAmount: z.number().or(z.string()).optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  documentUrl: z.string().optional(),
  signedAt: z.date().or(z.string()).optional(),
  terminatedAt: z.date().or(z.string()).optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const createLeaseContractSchema = z.object({
  propertyId: z.string(),
  unitId: z.string(),
  tenantId: z.string(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  rentAmount: z.number().positive('Rent amount must be positive'),
  depositAmount: z.number().min(0, 'Deposit amount must be non-negative'),
  paymentDueDay: z.number().int().min(1).max(31).default(1),
  lateFeeAmount: z.number().min(0).optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

export const updateLeaseContractSchema = createLeaseContractSchema
  .partial()
  .extend({
    status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']).optional(),
  });

export const paymentSchema = z.object({
  id: z.string(),
  leaseId: z.string(),
  amount: z.number().or(z.string()),
  dueDate: z.date().or(z.string()),
  paidDate: z.date().or(z.string()).optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const createPaymentSchema = z.object({
  leaseId: z.string(),
  amount: z.number().positive(),
  dueDate: z.string().or(z.date()),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const maintenanceRequestSchema = z.object({
  id: z.string(),
  leaseId: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  imageUrl: z.string().optional(),
  resolvedAt: z.date().or(z.string()).optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const createMaintenanceRequestSchema = z.object({
  leaseId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  imageUrl: z.string().optional(),
});

export type LeaseContract = z.infer<typeof leaseContractSchema>;
export type CreateLeaseContractInput = z.infer<typeof createLeaseContractSchema>;
export type UpdateLeaseContractInput = z.infer<typeof updateLeaseContractSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type MaintenanceRequest = z.infer<typeof maintenanceRequestSchema>;
export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>;

