import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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
  async getLeasesData(@Request() req) {
    try {
      // Get landlord profile for current user
      const landlordProfile = await this.databaseService.landlordProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!landlordProfile) {
        console.error('Landlord profile not found for user:', req.user.id);
        throw new Error('Landlord profile not found');
      }

      const leases = await this.leasesService.getLeasesData(landlordProfile.id);
      console.log('Returning leases:', leases.length);
      return leases;
    } catch (error) {
      console.error('Error in getLeasesData:', error);
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lease' })
  @ApiResponse({ status: 201, description: 'Lease created successfully' })
  async createLease(@Body() body: any, @Request() req) {
    // Get landlord profile for current user
    const landlordProfile = await this.databaseService.landlordProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!landlordProfile) {
      throw new Error('Landlord profile not found');
    }

    return this.leasesService.createLease({
      ...body,
      landlordId: landlordProfile.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lease by ID' })
  @ApiResponse({ status: 200, description: 'Lease retrieved successfully' })
  async getLeaseById(@Param('id') id: string) {
    return this.leasesService.getLeaseById(id);
  }
}
