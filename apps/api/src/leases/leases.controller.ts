import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';
import { LeasesService } from './leases.service';

@ApiTags('leases')
@Controller('leases')
@UseGuards(JwtAuthGuard)
export class LeasesController {
  constructor(
    private readonly leasesService: LeasesService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get leases data' })
  @ApiResponse({ status: 200, description: 'Leases data retrieved successfully' })
  async getLeasesData() {
    return this.leasesService.getLeasesData();
  }
}
