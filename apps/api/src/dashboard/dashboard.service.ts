import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PropertiesService } from '../properties/properties.service';
import { LeasesService } from '../leases/leases.service';
import { BillingService } from '../billing/billing.service';
import { MaintenanceService } from '../maintenance/maintenance.service';
import { addDays, subMonths, startOfMonth, endOfMonth, format, differenceInDays } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(
    private readonly db: DatabaseService,
    private readonly propertiesService: PropertiesService,
    private readonly leasesService: LeasesService,
    private readonly billingService: BillingService,
    private readonly maintenanceService: MaintenanceService,
  ) {}

  /**
   * Verify that the user has access to the landlord's data
   */
  async verifyLandlordAccess(userId: string, landlordId: string) {
    const landlordProfile = await this.db.landlordProfile.findUnique({
      where: { id: landlordId },
    });

    if (!landlordProfile) {
      throw new NotFoundException('Landlord not found');
    }

    // Check if the user is the landlord or an admin
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN' || landlordProfile.userId === userId) {
      return true;
    }

    throw new ForbiddenException('Access denied');
  }

  /**
   * Get aggregated dashboard summary
   */
  async getDashboardSummary(landlordId: string) {
    const [kpis, expiringLeases, vacantUnits, maintenanceSummary, revenue, recentActivity] = await Promise.all([
      this.getKPIs(landlordId),
      this.getExpiringLeases(landlordId),
      this.getVacantUnits(landlordId),
      this.getMaintenanceSummary(landlordId),
      this.getRevenueSummary(landlordId),
      this.getRecentActivity(landlordId),
    ]);

    return {
      kpis,
      expiringLeases,
      vacantUnits,
      maintenanceSummary,
      revenue,
      recentActivity,
    };
  }

  /**
   * Get KPI metrics
   */
  async getKPIs(landlordId: string) {
    const [properties, leases, invoices] = await Promise.all([
      this.db.property.findMany({
        where: { landlordId },
        include: { units: true },
      }),
      this.db.leaseContract.findMany({
        where: { landlordId, status: 'ACTIVE' },
        include: { unit: true },
      }),
      this.db.invoice.findMany({
        where: {
          lease: { landlordId },
          status: { in: ['UNPAID', 'OVERDUE'] },
        },
      }),
    ]);

    const totalProperties = properties.length;
    const totalUnits = properties.reduce((sum, prop) => sum + prop.totalUnits, 0);
    const occupiedUnits = leases.length;
    const occupancyRate = totalUnits > 0 ? occupiedUnits / totalUnits : 0;

    // Calculate expected rent (sum of all active lease rents)
    const expectedRent = leases.reduce((sum, lease) => sum + Number(lease.rentAmount), 0);

    // Calculate unpaid rent
    const unpaidRent = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);

    return {
      totalProperties,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      expectedRent: Math.round(expectedRent),
      unpaidRent: Math.round(unpaidRent),
    };
  }

  /**
   * Get expiring leases (next 30 days)
   */
  async getExpiringLeases(landlordId: string, daysAhead = 30) {
    const now = new Date();
    const until = addDays(now, daysAhead);

    const expiringLeases = await this.db.leaseContract.findMany({
      where: {
        landlordId,
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: until,
        },
      },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    return expiringLeases.map(lease => ({
      id: lease.id,
      unit: `${lease.unit.property.name} - ${lease.unit.name}`,
      tenant: lease.tenant.fullName,
      endDate: lease.endDate.toISOString().split('T')[0],
      daysUntilExpiry: differenceInDays(lease.endDate, now),
    }));
  }

  /**
   * Get vacant units
   */
  async getVacantUnits(landlordId: string) {
    const vacantUnits = await this.db.unit.findMany({
      where: {
        property: { landlordId },
        status: 'AVAILABLE',
      },
      include: {
        property: true,
        leases: {
          where: { status: 'ACTIVE' },
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
    });

    return vacantUnits.map(unit => {
      const lastLease = unit.leases[0];
      const daysVacant = lastLease ? differenceInDays(new Date(), lastLease.endDate) : 0;

      return {
        id: unit.id,
        unit: `${unit.property.name} - ${unit.name}`,
        type: `${unit.bedrooms || 0}BR`,
        rentAmount: Number(unit.rentAmount),
        daysVacant: Math.max(0, daysVacant),
      };
    });
  }

  /**
   * Get maintenance requests summary
   */
  async getMaintenanceSummary(landlordId: string) {
    const maintenanceRequests = await this.db.maintenanceRequest.findMany({
      where: {
        lease: { landlordId },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const overdueThreshold = addDays(now, -7); // Consider overdue if older than 7 days

    const summary = {
      open: 0,
      inProgress: 0,
      overdue: 0,
      resolved: 0,
      total: maintenanceRequests.length,
    };

    maintenanceRequests.forEach(request => {
      if (request.status === 'OPEN') {
        summary.open++;
        if (request.createdAt < overdueThreshold) {
          summary.overdue++;
        }
      } else if (request.status === 'IN_PROGRESS') {
        summary.inProgress++;
      } else if (request.status === 'RESOLVED' || request.status === 'CLOSED') {
        summary.resolved++;
      }
    });

    return summary;
  }

  /**
   * Get revenue summary (last 6 months)
   */
  async getRevenueSummary(landlordId: string, months = 6) {
    const now = new Date();
    const startDate = subMonths(startOfMonth(now), months - 1);

    const invoices = await this.db.invoice.findMany({
      where: {
        lease: { landlordId },
        periodStart: { gte: startDate },
      },
      include: {
        lease: true,
      },
      orderBy: {
        periodStart: 'asc',
      },
    });

    // Group by month
    const monthlyData = new Map();
    
    for (let i = 0; i < months; i++) {
      const monthStart = subMonths(startOfMonth(now), months - 1 - i);
      const monthKey = format(monthStart, 'MMM');
      
      monthlyData.set(monthKey, {
        month: monthKey,
        paid: 0,
        due: 0,
      });
    }

    invoices.forEach(invoice => {
      const monthKey = format(invoice.periodStart, 'MMM');
      const monthData = monthlyData.get(monthKey);
      
      if (monthData) {
        if (invoice.status === 'PAID') {
          monthData.paid += Number(invoice.totalAmount);
        } else {
          monthData.due += Number(invoice.totalAmount);
        }
      }
    });

    return Array.from(monthlyData.values()).reverse();
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(landlordId: string, limit = 10) {
    const activities: Array<{
      icon: string;
      text: string;
      time: string;
      type: string;
      createdAt: Date;
    }> = [];

    // Recent payments
    const recentPayments = await this.db.invoice.findMany({
      where: {
        lease: { landlordId },
        status: 'PAID',
        paidAt: { not: null },
      },
      include: {
        lease: {
          include: {
            tenant: true,
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
      take: 5,
    });

    recentPayments.forEach(payment => {
      activities.push({
        icon: '💵',
        text: `Payment received — $${Number(payment.totalAmount).toLocaleString()} from ${payment.lease.tenant.fullName}`,
        time: this.getTimeAgo(payment.paidAt!),
        type: 'payment',
        createdAt: payment.paidAt!,
      });
    });

    // Recent maintenance requests
    const recentMaintenance = await this.db.maintenanceRequest.findMany({
      where: {
        lease: { landlordId },
      },
      include: {
        lease: {
          include: {
            tenant: true,
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    recentMaintenance.forEach(request => {
      const statusIcon = request.status === 'OPEN' ? '🔧' : 
                       request.status === 'IN_PROGRESS' ? '⚙️' : 
                       request.status === 'RESOLVED' ? '✅' : '📋';
      
      activities.push({
        icon: statusIcon,
        text: `Maintenance request: ${request.title} from ${request.lease.tenant.fullName}`,
        time: this.getTimeAgo(request.createdAt),
        type: 'maintenance',
        createdAt: request.createdAt,
      });
    });

    // Recent lease activities
    const recentLeases = await this.db.leaseContract.findMany({
      where: { landlordId },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    recentLeases.forEach(lease => {
      const statusIcon = lease.status === 'ACTIVE' ? '📝' : 
                       lease.status === 'EXPIRED' ? '⏰' : 
                       lease.status === 'TERMINATED' ? '❌' : '📄';
      
      activities.push({
        icon: statusIcon,
        text: `Lease ${lease.status.toLowerCase()}: ${lease.unit.property.name} - ${lease.unit.name}`,
        time: this.getTimeAgo(lease.createdAt),
        type: 'lease',
        createdAt: lease.createdAt,
      });
    });

    // Sort by creation date and limit
    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Helper function to get time ago string
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  }
}