import { Controller, Get, Param } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get(':landlordId/expiring-leases')
  async getExpiringLeases(@Param('landlordId') landlordId: string) {
    return {
      message: 'Dashboard API is working!',
      landlordId,
      expiringLeases: []
    };
  }

  @Get(':landlordId/vacant-units')
  async getVacantUnits(@Param('landlordId') landlordId: string) {
    return {
      message: 'Dashboard API is working!',
      landlordId,
      vacantUnits: []
    };
  }

  @Get(':landlordId/kpi')
  async getKPIs(@Param('landlordId') landlordId: string) {
    return {
      message: 'Dashboard API is working!',
      landlordId,
      kpis: {}
    };
  }
}
