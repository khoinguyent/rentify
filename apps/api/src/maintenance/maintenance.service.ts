import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MaintenanceService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Get maintenance requests by landlord ID
   */
  async getMaintenanceByStatus(landlordId: string, status?: string) {
    const where: any = {
      lease: { landlordId },
    };

    if (status) {
      where.status = status;
    }

    return this.db.maintenanceRequest.findMany({
      where,
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
    });
  }

  /**
   * Get maintenance requests summary for dashboard
   */
  async getMaintenanceSummaryByLandlord(landlordId: string) {
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
    const overdueThreshold = new Date();
    overdueThreshold.setDate(now.getDate() - 7); // Consider overdue if older than 7 days

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
   * Create a new maintenance request
   */
  async createMaintenanceRequest(leaseId: string, data: {
    title: string;
    description: string;
    priority?: string;
    imageUrl?: string;
  }) {
    // Verify lease exists
    const lease = await this.db.leaseContract.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      throw new NotFoundException('Lease contract not found');
    }

    return this.db.maintenanceRequest.create({
      data: {
        leaseId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        imageUrl: data.imageUrl,
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
    });
  }

  /**
   * Update maintenance request status
   */
  async updateMaintenanceRequestStatus(requestId: string, status: string) {
    const request = await this.db.maintenanceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    const updateData: any = { status };

    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    return this.db.maintenanceRequest.update({
      where: { id: requestId },
      data: updateData,
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
    });
  }
}
