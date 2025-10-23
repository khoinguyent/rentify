import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateLeaseDto, UpdateLeaseDto } from './dto';

@Injectable()
export class LeasesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createLeaseDto: CreateLeaseDto, userId: string) {
    // Get landlord profile
    const landlordProfile = await this.db.landlordProfile.findUnique({
      where: { userId },
    });

    if (!landlordProfile) {
      throw new BadRequestException('User must be a landlord to create leases');
    }

    // Verify the property belongs to the landlord
    const property = await this.db.property.findUnique({
      where: { id: createLeaseDto.propertyId },
    });

    if (!property || property.landlordId !== landlordProfile.id) {
      throw new BadRequestException('Property not found or access denied');
    }

    return this.db.leaseContract.create({
      data: {
        ...createLeaseDto,
        landlordId: landlordProfile.id,
      },
      include: {
        property: true,
        unit: true,
        landlord: true,
        tenant: true,
      },
    });
  }

  async findAll(user: any, status?: string) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (user.role === 'LANDLORD') {
      const landlordProfile = await this.db.landlordProfile.findUnique({
        where: { userId: user.id },
      });
      if (landlordProfile) {
        where.landlordId = landlordProfile.id;
      }
    } else if (user.role === 'TENANT') {
      const tenantProfile = await this.db.tenantProfile.findUnique({
        where: { userId: user.id },
      });
      if (tenantProfile) {
        where.tenantId = tenantProfile.id;
      }
    }

    return this.db.leaseContract.findMany({
      where,
      include: {
        property: true,
        unit: true,
        landlord: true,
        tenant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const lease = await this.db.leaseContract.findUnique({
      where: { id },
      include: {
        property: true,
        unit: true,
        landlord: true,
        tenant: true,
        payments: true,
        maintenanceRequests: true,
      },
    });

    if (!lease) {
      throw new NotFoundException('Lease contract not found');
    }

    return lease;
  }

  async update(id: string, updateLeaseDto: UpdateLeaseDto) {
    await this.findOne(id);

    return this.db.leaseContract.update({
      where: { id },
      data: updateLeaseDto,
      include: {
        property: true,
        unit: true,
        landlord: true,
        tenant: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.db.leaseContract.delete({
      where: { id },
    });

    return { message: 'Lease contract deleted successfully' };
  }

  /**
   * Get active leases by landlord ID
   */
  async getActiveLeasesByLandlord(landlordId: string) {
    return this.db.leaseContract.findMany({
      where: { landlordId, status: 'ACTIVE' },
      include: {
        property: true,
        unit: true,
        landlord: true,
        tenant: true,
      },
    });
  }

  /**
   * Get expiring leases for a landlord (next 30 days)
   */
  async getExpiringLeasesByLandlord(landlordId: string, daysAhead = 30) {
    const now = new Date();
    const until = new Date();
    until.setDate(now.getDate() + daysAhead);

    return this.db.leaseContract.findMany({
      where: {
        landlordId,
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: until,
        },
      },
      include: {
        property: true,
        unit: true,
        landlord: true,
        tenant: true,
      },
      orderBy: {
        endDate: 'asc',
      },
    });
  }
}

