import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';
import { BillingService } from './billing.service';

@ApiTags('billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get billing data' })
  @ApiResponse({ status: 200, description: 'Billing data retrieved successfully' })
  async getBillingData() {
    return this.billingService.getBillingData();
  }
}
