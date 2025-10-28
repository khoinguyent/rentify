import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { addDays, addMonths, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class TenantsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Verify that the user has access to the tenant's data
   */
  async verifyTenantAccess(userId: string, tenantId: string) {
    const tenantProfile = await this.db.tenantProfile.findUnique({
      where: { id: tenantId },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if the user is the tenant or an admin
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN' || tenantProfile.userId === userId) {
      return true;
    }

    throw new ForbiddenException('Access denied');
  }

  /**
   * Get tenant's active lease information
   */
  async getTenantLease(tenantId: string, userId: string) {
    // Get tenant profile - the tenantId parameter is actually the userId
    const tenantProfile = await this.db.tenantProfile.findUnique({
      where: { userId: tenantId },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    // Verify access
    if (userId !== tenantId && userId !== tenantProfile.userId) {
      const user = await this.db.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Access denied');
      }
    }

    // Get active lease
    const lease = await this.db.leaseContract.findFirst({
      where: {
        tenantId: tenantProfile.id,
        status: 'ACTIVE',
      },
      include: {
        property: true,
        unit: true,
        landlord: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    if (!lease) {
      return null;
    }

    return {
      id: lease.id,
      startDate: lease.startDate.toISOString(),
      endDate: lease.endDate.toISOString(),
      rentAmount: lease.rentAmount.toString(),
      depositAmount: lease.depositAmount.toString(),
      status: lease.status,
      property: {
        name: lease.property.name,
        address: lease.property.address,
      },
      unit: {
        name: lease.unit.name,
      },
      landlord: {
        name: lease.landlord.name,
      },
    };
  }

  /**
   * Get tenant's upcoming payments (next 3 months)
   */
  async getUpcomingPayments(tenantId: string, userId: string) {
    // Get tenant profile
    const tenantProfile = await this.db.tenantProfile.findUnique({
      where: { userId: tenantId },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    // Verify access
    if (userId !== tenantId && userId !== tenantProfile.userId) {
      const user = await this.db.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Access denied');
      }
    }

    // Get tenant's active lease
    const lease = await this.db.leaseContract.findFirst({
      where: {
        tenantId: tenantProfile.id,
        status: 'ACTIVE',
      },
    });

    if (!lease) {
      return [];
    }

    // Calculate upcoming payments based on billing cycle
    const now = new Date();
    const payments: Array<{ id: string; description: string; amount: number; dueDate: string }> = [];
    const billingCycleMonths = lease.billingCycleMonths || 1;
    const billingDay = lease.billingDay || 1;
    const rentAmount = Number(lease.rentAmount);

    // Get all fees for this lease
    const fees = await this.db.leaseFee.findMany({
      where: {
        leaseId: lease.id,
        isActive: true,
      },
    });

    for (let i = 0; i < 3; i++) {
      const monthOffset = i * billingCycleMonths;
      const startDate = addMonths(now, monthOffset);
      const dueDate = new Date(startDate.getFullYear(), startDate.getMonth(), billingDay);

      if (dueDate >= now) {
        // Calculate total amount including fees
        let totalAmount = rentAmount;
        for (const fee of fees) {
          if (fee.type === 'FIXED' && fee.amount) {
            totalAmount += Number(fee.amount);
          }
          // Variable fees would need usage data
        }

        payments.push({
          id: `payment-${i}`,
          description: `Rent for ${dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          amount: totalAmount,
          dueDate: dueDate.toISOString(),
        });
      }
    }

    return payments;
  }

  /**
   * Get tenant's payment history
   */
  async getPaymentHistory(tenantId: string, userId: string) {
    // Get tenant profile
    const tenantProfile = await this.db.tenantProfile.findUnique({
      where: { userId: tenantId },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    // Verify access
    if (userId !== tenantId && userId !== tenantProfile.userId) {
      const user = await this.db.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Access denied');
      }
    }

    // Get tenant's active lease
    const lease = await this.db.leaseContract.findFirst({
      where: {
        tenantId: tenantProfile.id,
        status: 'ACTIVE',
      },
    });

    if (!lease) {
      return [];
    }

    // Get invoices for this lease
    const invoices = await this.db.invoice.findMany({
      where: {
        leaseId: lease.id,
        status: 'PAID',
      },
      orderBy: {
        paidAt: 'desc',
      },
      take: 10,
    });

    return invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.totalAmount.toString(),
      paidDate: invoice.paidAt?.toISOString(),
      periodStart: invoice.periodStart.toISOString(),
      periodEnd: invoice.periodEnd.toISOString(),
    }));
  }

  /**
   * Get tenant's invoices
   */
  async getInvoices(tenantId: string, userId: string) {
    // Get tenant profile
    const tenantProfile = await this.db.tenantProfile.findUnique({
      where: { userId: tenantId },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    // Verify access
    if (userId !== tenantId && userId !== tenantProfile.userId) {
      const user = await this.db.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Access denied');
      }
    }

    // Get tenant's active lease
    const lease = await this.db.leaseContract.findFirst({
      where: {
        tenantId: tenantProfile.id,
        status: 'ACTIVE',
      },
    });

    if (!lease) {
      return [];
    }

    // Get all invoices for this lease
    const invoices = await this.db.invoice.findMany({
      where: {
        leaseId: lease.id,
      },
      orderBy: {
        dueDate: 'desc',
      },
      take: 20,
    });

    return invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.totalAmount.toString(),
      status: invoice.status,
      dueDate: invoice.dueDate.toISOString(),
      periodStart: invoice.periodStart.toISOString(),
      periodEnd: invoice.periodEnd.toISOString(),
    }));
  }

  /**
   * Get all tenant leases
   */
  async getTenantLeases(tenantId: string, userId: string) {
    // Get tenant profile
    const tenantProfile = await this.db.tenantProfile.findUnique({
      where: { userId: tenantId },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    // Verify access
    if (userId !== tenantId && userId !== tenantProfile.userId) {
      const user = await this.db.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Access denied');
      }
    }

    // Get all leases for this tenant
    const leases = await this.db.leaseContract.findMany({
      where: {
        tenantId: tenantProfile.id,
      },
      include: {
        property: true,
        unit: true,
      },
      orderBy: [
        { status: 'asc' }, // Active first
        { endDate: 'asc' }, // Then by end date
      ],
    });

    return leases.map(lease => ({
      id: lease.id,
      startDate: lease.startDate.toISOString(),
      endDate: lease.endDate.toISOString(),
      rentAmount: lease.rentAmount,
      status: lease.status,
      property: {
        id: lease.property.id,
        name: lease.property.name,
        address: lease.property.address,
      },
      unit: {
        id: lease.unit.id,
        name: lease.unit.name,
      },
    }));
  }

  /**
   * Get tenant's maintenance requests
   */
  async getMaintenanceRequests(tenantId: string, userId: string) {
    // Get tenant profile
    const tenantProfile = await this.db.tenantProfile.findUnique({
      where: { userId: tenantId },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    // Verify access
    if (userId !== tenantId && userId !== tenantProfile.userId) {
      const user = await this.db.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenException('Access denied');
      }
    }

    // Get tenant's active lease
    const lease = await this.db.leaseContract.findFirst({
      where: {
        tenantId: tenantProfile.id,
        status: 'ACTIVE',
      },
    });

    if (!lease) {
      return [];
    }

    // Get maintenance requests for this lease
    const requests = await this.db.maintenanceRequest.findMany({
      where: {
        leaseId: lease.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return requests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      status: request.status,
      priority: request.priority,
      createdAt: request.createdAt.toISOString(),
      resolvedAt: request.resolvedAt?.toISOString(),
    }));
  }
}

