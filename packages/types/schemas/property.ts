import { z } from 'zod';

export const propertySchema = z.object({
  id: z.string(),
  landlordId: z.string(),
  name: z.string(),
  type: z.enum(['APARTMENT', 'HOUSE', 'CONDO', 'COMMERCIAL', 'OFFICE', 'WAREHOUSE', 'LAND']),
  address: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('US'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  yearBuilt: z.number().optional(),
  totalUnits: z.number().default(1),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const createPropertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  type: z.enum(['APARTMENT', 'HOUSE', 'CONDO', 'COMMERCIAL', 'OFFICE', 'WAREHOUSE', 'LAND']),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('US'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  totalUnits: z.number().int().min(1).default(1),
});

export const updatePropertySchema = createPropertySchema.partial();

export const unitSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  name: z.string(),
  floor: z.number().optional(),
  rentAmount: z.number().or(z.string()),
  sizeM2: z.number().or(z.string()).optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const createUnitSchema = z.object({
  propertyId: z.string(),
  name: z.string().min(1, 'Unit name is required'),
  floor: z.number().int().optional(),
  rentAmount: z.number().positive('Rent amount must be positive'),
  sizeM2: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).default('AVAILABLE'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const updateUnitSchema = createUnitSchema.partial().omit({ propertyId: true });

export const amenitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const createAmenitySchema = z.object({
  name: z.string().min(1, 'Amenity name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export type Property = z.infer<typeof propertySchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type Unit = z.infer<typeof unitSchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type Amenity = z.infer<typeof amenitySchema>;
export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;

