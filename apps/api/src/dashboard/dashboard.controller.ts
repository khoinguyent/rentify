import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('my-profile')
  @ApiOperation({ summary: 'Get current landlord profile ID' })
  @ApiResponse({ status: 200, description: 'Landlord profile retrieved successfully' })
  async getMyLandlordProfile(@Request() req) {
    // Get the landlord profile for the authenticated user
    const landlordProfile = await this.dashboardService.getLandlordProfileByUserId(req.user.id);
    return { landlordId: landlordProfile.id };
  }

  @Get(':landlordId')
  @ApiOperation({ summary: 'Get complete dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved successfully' })
  async getDashboardSummary(@Param('landlordId') landlordId: string, @Request() req) {
    await this.dashboardService.verifyLandlordAccess(req.user.id, landlordId);
    return this.dashboardService.getDashboardSummary(landlordId);
  }

  @Get(':landlordId/kpi')
  @ApiOperation({ summary: 'Get KPI metrics' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  async getKPIs(@Param('landlordId') landlordId: string, @Request() req) {
    await this.dashboardService.verifyLandlordAccess(req.user.id, landlordId);
    return this.dashboardService.getKPIs(landlordId);
  }

  @Get(':landlordId/expiring-leases')
  @ApiOperation({ summary: 'Get expiring leases' })
  @ApiResponse({ status: 200, description: 'Expiring leases retrieved successfully' })
  async getExpiringLeases(@Param('landlordId') landlordId: string, @Request() req) {
    await this.dashboardService.verifyLandlordAccess(req.user.id, landlordId);
    return this.dashboardService.getExpiringLeases(landlordId);
  }

  @Get(':landlordId/vacant-units')
  @ApiOperation({ summary: 'Get vacant units' })
  @ApiResponse({ status: 200, description: 'Vacant units retrieved successfully' })
  async getVacantUnits(@Param('landlordId') landlordId: string, @Request() req) {
    await this.dashboardService.verifyLandlordAccess(req.user.id, landlordId);
    return this.dashboardService.getVacantUnits(landlordId);
  }

  @Get(':landlordId/maintenance')
  @ApiOperation({ summary: 'Get maintenance summary' })
  @ApiResponse({ status: 200, description: 'Maintenance summary retrieved successfully' })
  async getMaintenanceSummary(@Param('landlordId') landlordId: string, @Request() req) {
    await this.dashboardService.verifyLandlordAccess(req.user.id, landlordId);
    return this.dashboardService.getMaintenanceSummary(landlordId);
  }

  @Get(':landlordId/revenue')
  @ApiOperation({ summary: 'Get revenue summary' })
  @ApiResponse({ status: 200, description: 'Revenue summary retrieved successfully' })
  async getRevenueSummary(@Param('landlordId') landlordId: string, @Request() req) {
    await this.dashboardService.verifyLandlordAccess(req.user.id, landlordId);
    return this.dashboardService.getRevenueSummary(landlordId);
  }

  @Get(':landlordId/activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved successfully' })
  async getRecentActivity(@Param('landlordId') landlordId: string, @Request() req) {
    await this.dashboardService.verifyLandlordAccess(req.user.id, landlordId);
    return this.dashboardService.getRecentActivity(landlordId);
  }
}
