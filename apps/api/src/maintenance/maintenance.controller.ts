import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceService } from './maintenance.service';
import { DatabaseService } from '../database/database.service';

@ApiTags('maintenance')
@Controller('maintenance-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a maintenance request' })
  @ApiResponse({ status: 201, description: 'Maintenance request created successfully' })
  async createMaintenanceRequest(@Body() body: any, @Request() req) {
    // Get tenant profile for current user
    const tenantProfile = await this.databaseService.tenantProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tenantProfile) {
      throw new Error('Tenant profile not found');
    }

    // Verify the lease belongs to this tenant
    const lease = await this.databaseService.leaseContract.findUnique({
      where: { id: body.leaseId },
      include: { tenant: true },
    });

    if (!lease || lease.tenantId !== tenantProfile.id) {
      throw new Error('Access denied: This lease does not belong to you');
    }

    return this.maintenanceService.createMaintenanceRequest(body.leaseId, {
      title: body.title,
      description: body.description,
      priority: body.priority,
    });
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all maintenance requests (for landlords)' })
  @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
  async getAllMaintenanceRequests(@Request() req) {
    // Get landlord profile
    const landlordProfile = await this.databaseService.landlordProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!landlordProfile) {
      throw new Error('Landlord profile not found');
    }

    // Get all maintenance requests for landlord's properties
    const leases = await this.databaseService.leaseContract.findMany({
      where: { landlordId: landlordProfile.id },
      select: { id: true },
    });

    const leaseIds = leases.map(l => l.id);

    return this.databaseService.maintenanceRequest.findMany({
      where: {
        leaseId: { in: leaseIds },
      },
      include: {
        lease: {
          include: {
            property: true,
            unit: true,
            tenant: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get maintenance requests for current tenant' })
  @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
  async getTenantMaintenanceRequests(@Request() req) {
    const tenantProfile = await this.databaseService.tenantProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tenantProfile) {
      throw new Error('Tenant profile not found');
    }

    const leases = await this.databaseService.leaseContract.findMany({
      where: { tenantId: tenantProfile.id },
      select: { id: true },
    });

    const leaseIds = leases.map(l => l.id);

    return this.databaseService.maintenanceRequest.findMany({
      where: {
        leaseId: { in: leaseIds },
      },
      include: {
        lease: {
          include: {
            property: true,
            unit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update maintenance request status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.maintenanceService.updateMaintenanceRequestStatus(id, body.status);
  }
}

