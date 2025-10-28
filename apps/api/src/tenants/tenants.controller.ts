import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get(':tenantId/lease')
  @ApiOperation({ summary: 'Get tenant lease information' })
  @ApiResponse({ status: 200, description: 'Lease information retrieved successfully' })
  async getTenantLease(@Param('tenantId') tenantId: string, @Request() req) {
    return this.tenantsService.getTenantLease(tenantId, req.user?.id);
  }

  @Get(':tenantId/upcoming-payments')
  @ApiOperation({ summary: 'Get tenant upcoming payments' })
  @ApiResponse({ status: 200, description: 'Upcoming payments retrieved successfully' })
  async getUpcomingPayments(@Param('tenantId') tenantId: string, @Request() req) {
    return this.tenantsService.getUpcomingPayments(tenantId, req.user?.id);
  }

  @Get(':tenantId/payment-history')
  @ApiOperation({ summary: 'Get tenant payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  async getPaymentHistory(@Param('tenantId') tenantId: string, @Request() req) {
    return this.tenantsService.getPaymentHistory(tenantId, req.user?.id);
  }

  @Get(':tenantId/invoices')
  @ApiOperation({ summary: 'Get tenant invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async getInvoices(@Param('tenantId') tenantId: string, @Request() req) {
    return this.tenantsService.getInvoices(tenantId, req.user?.id);
  }

  @Get(':tenantId/maintenance-requests')
  @ApiOperation({ summary: 'Get tenant maintenance requests' })
  @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
  async getMaintenanceRequests(@Param('tenantId') tenantId: string, @Request() req) {
    return this.tenantsService.getMaintenanceRequests(tenantId, req.user?.id);
  }

  @Get(':tenantId/leases')
  @ApiOperation({ summary: 'Get all tenant leases' })
  @ApiResponse({ status: 200, description: 'Leases retrieved successfully' })
  async getTenantLeases(@Param('tenantId') tenantId: string, @Request() req) {
    return this.tenantsService.getTenantLeases(tenantId, req.user?.id);
  }
}

