import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto, UpdateLeaseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Leases')
@Controller('leases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lease contract' })
  create(@Body() createLeaseDto: CreateLeaseDto, @Request() req) {
    return this.leasesService.create(createLeaseDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lease contracts' })
  findAll(@Request() req, @Query('status') status?: string) {
    return this.leasesService.findAll(req.user, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lease contract by ID' })
  findOne(@Param('id') id: string) {
    return this.leasesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lease contract' })
  update(@Param('id') id: string, @Body() updateLeaseDto: UpdateLeaseDto) {
    return this.leasesService.update(id, updateLeaseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lease contract' })
  remove(@Param('id') id: string) {
    return this.leasesService.remove(id);
  }
}

