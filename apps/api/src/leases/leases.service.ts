import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeasesService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Get all leases for a landlord with related data
  async getLeasesData(landlordId?: string) {
    const whereClause = landlordId ? { landlordId } : {};
    console.log('Fetching leases for landlordId:', landlordId);
    
    const leases = await this.databaseService.leaseContract.findMany({
      where: whereClause,
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    console.log(`Found ${leases.length} leases`);
    
    const result = leases.map((lease) => {
      try {
        return {
          id: lease.id,
          startDate: lease.startDate instanceof Date ? lease.startDate.toISOString() : lease.startDate,
          endDate: lease.endDate instanceof Date ? lease.endDate.toISOString() : lease.endDate,
          rentAmount: lease.rentAmount ? parseFloat(lease.rentAmount.toString()) : 0,
          status: lease.status,
          property: lease.property ? {
            id: lease.property.id,
            name: lease.property.name,
          } : null,
          unit: lease.unit ? {
            id: lease.unit.id,
            name: lease.unit.name,
          } : null,
          tenant: lease.tenant,
        };
      } catch (error) {
        console.error('Error mapping lease:', error, lease);
        return null;
      }
    }).filter(lease => lease !== null);
    
    console.log(`Returning ${result.length} mapped leases`);
    return result;
  }

  async createLease(data: {
    propertyId: string;
    unitId: string;
    landlordId: string;
    tenantInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dateOfBirth?: string;
      gender?: string;
      nationality?: string;
      idType?: string;
      idNumber: string;
    };
    leaseInfo: {
      startDate: string;
      endDate: string;
      rentAmount: number;
      depositAmount: number;
      billingDay: number;
      billingCycleMonths: number;
      discountType?: 'PERCENT' | 'FIXED';
      discountValue?: number;
      lateFeeAmount?: number;
    };
    fixedFees?: Array<{ name: string; amount: number }>;
    variableFees?: Array<{ name: string; unitPrice: number; billingUnit: string }>;
  }) {
    // Start transaction
    return this.databaseService.$transaction(async (tx) => {
      // 1. Check if property exists
      const property = await tx.property.findUnique({
        where: { id: data.propertyId },
        include: { landlord: true },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      if (property.landlordId !== data.landlordId) {
        throw new BadRequestException('Property does not belong to this landlord');
      }

      // 2. Check if unit exists and belongs to property
      const unit = await tx.unit.findUnique({
        where: { id: data.unitId },
      });

      if (!unit || unit.propertyId !== data.propertyId) {
        throw new NotFoundException('Unit not found or does not belong to this property');
      }

      // 3. Create or find tenant user
      let tenantUser = await tx.user.findUnique({
        where: { email: data.tenantInfo.email },
      });

      if (!tenantUser) {
        // Create new tenant user
        const password = await bcrypt.hash('tempPassword123', 10);
        tenantUser = await tx.user.create({
          data: {
            email: data.tenantInfo.email,
            passwordHash: password,
            firstName: data.tenantInfo.firstName,
            lastName: data.tenantInfo.lastName,
            role: 'TENANT',
            emailVerified: new Date(),
          },
        });

        // Create tenant profile
        await tx.tenantProfile.create({
          data: {
            userId: tenantUser.id,
            fullName: `${data.tenantInfo.firstName} ${data.tenantInfo.lastName}`,
            email: data.tenantInfo.email,
            phone: data.tenantInfo.phone,
            dateOfBirth: data.tenantInfo.dateOfBirth ? new Date(data.tenantInfo.dateOfBirth) : null,
            gender: data.tenantInfo.gender,
            nationality: data.tenantInfo.nationality,
            idType: data.tenantInfo.idType,
            idNumber: data.tenantInfo.idNumber,
          },
        });
      }

      // Get or update tenant profile
      let tenantProfile = await tx.tenantProfile.findUnique({
        where: { userId: tenantUser.id },
      });

      if (!tenantProfile) {
        // Create profile if it doesn't exist
        tenantProfile = await tx.tenantProfile.create({
          data: {
            userId: tenantUser.id,
            fullName: `${data.tenantInfo.firstName} ${data.tenantInfo.lastName}`,
            email: data.tenantInfo.email,
            phone: data.tenantInfo.phone,
            dateOfBirth: data.tenantInfo.dateOfBirth ? new Date(data.tenantInfo.dateOfBirth) : null,
            gender: data.tenantInfo.gender,
            nationality: data.tenantInfo.nationality,
            idType: data.tenantInfo.idType,
            idNumber: data.tenantInfo.idNumber,
          },
        });
      } else {
        // Update existing profile with new information
        tenantProfile = await tx.tenantProfile.update({
          where: { userId: tenantUser.id },
          data: {
            fullName: `${data.tenantInfo.firstName} ${data.tenantInfo.lastName}`,
            phone: data.tenantInfo.phone,
            dateOfBirth: data.tenantInfo.dateOfBirth ? new Date(data.tenantInfo.dateOfBirth) : tenantProfile.dateOfBirth,
            gender: data.tenantInfo.gender || tenantProfile.gender,
            nationality: data.tenantInfo.nationality || tenantProfile.nationality,
            idType: data.tenantInfo.idType || tenantProfile.idType,
            idNumber: data.tenantInfo.idNumber || tenantProfile.idNumber,
          },
        });
      }

      // 4. Create lease contract
      const lease = await tx.leaseContract.create({
        data: {
          propertyId: data.propertyId,
          unitId: data.unitId,
          landlordId: data.landlordId,
          tenantId: tenantProfile.id,
          startDate: new Date(data.leaseInfo.startDate),
          endDate: new Date(data.leaseInfo.endDate),
          rentAmount: data.leaseInfo.rentAmount,
          depositAmount: data.leaseInfo.depositAmount,
          status: 'ACTIVE',
          billingDay: data.leaseInfo.billingDay,
          billingCycleMonths: data.leaseInfo.billingCycleMonths,
          discountType: data.leaseInfo.discountType,
          discountValue: data.leaseInfo.discountValue ? data.leaseInfo.discountValue : null,
          lateFeeAmount: data.leaseInfo.lateFeeAmount ? data.leaseInfo.lateFeeAmount : null,
          signedAt: new Date(),
        },
      });

      // 5. Create fixed fees if provided
      if (data.fixedFees && data.fixedFees.length > 0) {
        await Promise.all(
          data.fixedFees
            .filter(fee => fee.name && fee.amount > 0)
            .map(fee =>
              tx.leaseFee.create({
                data: {
                  leaseId: lease.id,
                  name: fee.name,
                  type: 'FIXED',
                  amount: fee.amount,
                  isMandatory: true,
                  isActive: true,
                },
              })
            )
        );
      }

      // 6. Create variable fees if provided
      if (data.variableFees && data.variableFees.length > 0) {
        await Promise.all(
          data.variableFees
            .filter(fee => fee.name && fee.unitPrice > 0 && fee.billingUnit)
            .map(fee =>
              tx.leaseFee.create({
                data: {
                  leaseId: lease.id,
                  name: fee.name,
                  type: 'VARIABLE',
                  unitPrice: fee.unitPrice,
                  billingUnit: fee.billingUnit,
                  isMandatory: true,
                  isActive: true,
                },
              })
            )
        );
      }

      // 7. Update unit status to OCCUPIED
      await tx.unit.update({
        where: { id: data.unitId },
        data: { status: 'OCCUPIED' },
      });

      // 8. Update property status to RENTED
      await tx.property.update({
        where: { id: data.propertyId },
        data: { status: 'RENTED' },
      });

      return {
        lease,
        tenant: tenantProfile,
        message: 'Lease created successfully',
      };
    });
  }

  async getLeaseById(id: string) {
    const lease = await this.databaseService.leaseContract.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
          },
        },
        landlord: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            nationality: true,
            idType: true,
            idNumber: true,
          },
        },
        fees: true,
      },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    // Serialize the lease data to ensure JSON compatibility
    const serializedLease: any = {
      ...lease,
      startDate: lease.startDate instanceof Date ? lease.startDate.toISOString() : lease.startDate,
      endDate: lease.endDate instanceof Date ? lease.endDate.toISOString() : lease.endDate,
      signedAt: lease.signedAt instanceof Date ? lease.signedAt.toISOString() : lease.signedAt,
      rentAmount: lease.rentAmount ? parseFloat(lease.rentAmount.toString()) : 0,
      depositAmount: lease.depositAmount ? parseFloat(lease.depositAmount.toString()) : undefined,
      discountValue: lease.discountValue ? parseFloat(lease.discountValue.toString()) : undefined,
      lateFeeAmount: lease.lateFeeAmount ? parseFloat(lease.lateFeeAmount.toString()) : undefined,
    };

    // Serialize tenant data if it exists
    if (lease.tenant && typeof lease.tenant === 'object') {
      serializedLease.tenant = {
        ...lease.tenant,
        dateOfBirth: lease.tenant.dateOfBirth instanceof Date ? lease.tenant.dateOfBirth.toISOString() : lease.tenant.dateOfBirth,
      };
    }

    return serializedLease;
  }
}
