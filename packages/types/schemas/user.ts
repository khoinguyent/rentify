import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['ADMIN', 'LANDLORD', 'TENANT', 'AGENT']),
  isActive: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const landlordProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export const createLandlordProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export const tenantProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.date().or(z.string()).optional(),
  emergencyContact: z.string().optional(),
});

export const createTenantProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LandlordProfile = z.infer<typeof landlordProfileSchema>;
export type CreateLandlordProfileInput = z.infer<typeof createLandlordProfileSchema>;
export type TenantProfile = z.infer<typeof tenantProfileSchema>;
export type CreateTenantProfileInput = z.infer<typeof createTenantProfileSchema>;

