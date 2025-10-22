import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { UsageService } from './usage.service';
import {
  CreateLeaseFeeDto,
  UpdateLeaseFeeDto,
  RecordUsageDto,
  BulkRecordUsageDto,
  GenerateInvoiceDto,
  PayInvoiceDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';

@ApiTags('Billing & Invoices')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly usageService: UsageService,
    private readonly db: DatabaseService
  ) {}

  // ===== LEASE FEES =====

  @Post('leases/:leaseId/fees')
  @ApiOperation({ summary: 'Add a fee to a lease' })
  async createLeaseFee(@Param('leaseId') leaseId: string, @Body() dto: CreateLeaseFeeDto) {
    return this.db.leaseFee.create({
      data: {
        leaseId,
        name: dto.name,
        type: dto.type,
        amount: dto.amount,
        unitPrice: dto.unitPrice,
        billingUnit: dto.billingUnit,
        isMandatory: dto.isMandatory ?? true,
        isActive: dto.isActive ?? true,
      },
    });
  }

  @Get('leases/:leaseId/fees')
  @ApiOperation({ summary: 'Get all fees for a lease' })
  async getLeaseFees(@Param('leaseId') leaseId: string) {
    return this.db.leaseFee.findMany({
      where: { leaseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch('fees/:feeId')
  @ApiOperation({ summary: 'Update a lease fee' })
  async updateLeaseFee(@Param('feeId') feeId: string, @Body() dto: UpdateLeaseFeeDto) {
    return this.db.leaseFee.update({
      where: { id: feeId },
      data: dto,
    });
  }

  @Delete('fees/:feeId')
  @ApiOperation({ summary: 'Delete a lease fee' })
  async deleteLeaseFee(@Param('feeId') feeId: string) {
    await this.db.leaseFee.delete({
      where: { id: feeId },
    });
    return { message: 'Fee deleted successfully' };
  }

  // ===== USAGE TRACKING =====

  @Post('leases/:leaseId/usage')
  @ApiOperation({ summary: 'Record usage for a variable fee' })
  async recordUsage(@Param('leaseId') leaseId: string, @Body() dto: RecordUsageDto) {
    return this.usageService.recordUsage(
      leaseId,
      dto.feeId,
      dto.usageValue,
      new Date(dto.periodMonth)
    );
  }

  @Post('leases/:leaseId/usage/bulk')
  @ApiOperation({ summary: 'Bulk record usage for multiple fees' })
  async bulkRecordUsage(@Param('leaseId') leaseId: string, @Body() dto: BulkRecordUsageDto) {
    const usageData = dto.usageData.map((item) => ({
      feeId: item.feeId,
      usageValue: item.usageValue,
      periodMonth: new Date(item.periodMonth),
    }));

    return this.usageService.bulkRecordUsage(leaseId, usageData);
  }

  @Get('leases/:leaseId/usage')
  @ApiOperation({ summary: 'Get usage records for a lease' })
  @ApiQuery({ name: 'periodStart', required: false })
  @ApiQuery({ name: 'periodEnd', required: false })
  async getUsageForLease(
    @Param('leaseId') leaseId: string,
    @Query('periodStart') periodStart?: string,
    @Query('periodEnd') periodEnd?: string
  ) {
    if (periodStart && periodEnd) {
      return this.usageService.getUsageForPeriod(
        leaseId,
        new Date(periodStart),
        new Date(periodEnd)
      );
    }

    return this.usageService.getUsageForLease(leaseId);
  }

  @Get('leases/:leaseId/usage/summary')
  @ApiOperation({ summary: 'Get usage summary for a period' })
  @ApiQuery({ name: 'periodStart', required: true })
  @ApiQuery({ name: 'periodEnd', required: true })
  async getUsageSummary(
    @Param('leaseId') leaseId: string,
    @Query('periodStart') periodStart: string,
    @Query('periodEnd') periodEnd: string
  ) {
    return this.usageService.getUsageSummary(
      leaseId,
      new Date(periodStart),
      new Date(periodEnd)
    );
  }

  @Delete('usage/:usageId')
  @ApiOperation({ summary: 'Delete a usage record' })
  async deleteUsageRecord(@Param('usageId') usageId: string) {
    return this.usageService.deleteUsageRecord(usageId);
  }

  // ===== INVOICES =====

  @Post('leases/:leaseId/invoices/generate')
  @ApiOperation({ summary: 'Generate invoice for a lease' })
  async generateInvoice(@Param('leaseId') leaseId: string, @Body() dto?: GenerateInvoiceDto) {
    const customPeriod = dto?.periodStart && dto?.periodEnd
      ? {
          start: new Date(dto.periodStart),
          end: new Date(dto.periodEnd),
        }
      : undefined;

    return this.billingService.generateInvoiceForLease(leaseId, customPeriod);
  }

  @Post('billing/generate-today')
  @ApiOperation({ summary: 'Generate all invoices due today (admin/scheduled job)' })
  async generateInvoicesForToday() {
    return this.billingService.generateInvoicesForToday();
  }

  @Get('leases/:leaseId/invoices')
  @ApiOperation({ summary: 'Get all invoices for a lease' })
  async getInvoicesForLease(@Param('leaseId') leaseId: string) {
    return this.billingService.getInvoicesForLease(leaseId);
  }

  @Get('invoices/:invoiceId')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async getInvoice(@Param('invoiceId') invoiceId: string) {
    return this.billingService.getInvoiceById(invoiceId);
  }

  @Patch('invoices/:invoiceId/pay')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  async payInvoice(@Param('invoiceId') invoiceId: string, @Body() dto: PayInvoiceDto) {
    return this.billingService.markInvoiceAsPaid(
      invoiceId,
      dto.paidAmount,
      dto.paymentMethod
    );
  }

  @Post('billing/update-overdue')
  @ApiOperation({ summary: 'Update overdue invoice statuses (admin/scheduled job)' })
  async updateOverdueInvoices() {
    return this.billingService.updateOverdueInvoices();
  }

  // ===== STATISTICS =====

  @Get('leases/:leaseId/billing-stats')
  @ApiOperation({ summary: 'Get billing statistics for a lease' })
  async getBillingStats(@Param('leaseId') leaseId: string) {
    const invoices = await this.billingService.getInvoicesForLease(leaseId);
    
    const stats = {
      totalInvoices: invoices.length,
      totalBilled: invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
      totalPaid: invoices
        .filter((inv) => inv.status === 'PAID')
        .reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0),
      unpaidInvoices: invoices.filter((inv) => inv.status === 'UNPAID').length,
      overdueInvoices: invoices.filter((inv) => inv.status === 'OVERDUE').length,
      paidInvoices: invoices.filter((inv) => inv.status === 'PAID').length,
    };

    return stats;
  }
}

