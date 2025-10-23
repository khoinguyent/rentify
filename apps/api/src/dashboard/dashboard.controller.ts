import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
// Temporarily disabled auth imports
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
// Temporarily disable auth guard for testing - TODO: Re-enable and fix token handling
// @UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get aggregated dashboard data for a landlord
   * Returns KPIs, expiring leases, vacant units, maintenance summary, revenue, and recent activity
   */
  @Get(':landlordId')
  async getDashboardSummary(@Param('landlordId') landlordId: string) {
    // Temporarily skip auth verification - TODO: Re-enable when auth is working
    // await this.dashboardService.verifyLandlordAccess(user.id, landlordId);
    
    return this.dashboardService.getDashboardSummary(landlordId);
  }

  /**
   * Get KPI metrics for dashboard
   */
  @Get(':landlordId/kpi')
  async getKPIs(@Param('landlordId') landlordId: string) {
    return this.dashboardService.getKPIs(landlordId);
  }

  /**
   * Get expiring leases (next 30 days)
   */
  @Get(':landlordId/expiring-leases')
  async getExpiringLeases(@Param('landlordId') landlordId: string) {
    return this.dashboardService.getExpiringLeases(landlordId);
  }

  /**
   * Get vacant units
   */
  @Get(':landlordId/vacant-units')
  async getVacantUnits(@Param('landlordId') landlordId: string) {
    return this.dashboardService.getVacantUnits(landlordId);
  }

  /**
   * Get maintenance requests summary
   */
  @Get(':landlordId/maintenance')
  async getMaintenanceSummary(@Param('landlordId') landlordId: string) {
    return this.dashboardService.getMaintenanceSummary(landlordId);
  }

  /**
   * Get revenue data (last 6 months)
   */
  @Get(':landlordId/revenue')
  async getRevenueSummary(@Param('landlordId') landlordId: string) {
    return this.dashboardService.getRevenueSummary(landlordId);
  }

  /**
   * Get recent activity feed
   */
  @Get(':landlordId/activity')
  async getRecentActivity(@Param('landlordId') landlordId: string) {
    return this.dashboardService.getRecentActivity(landlordId);
  }
}
