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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    return this.propertiesService.create(createPropertyDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  findAll(@Request() req, @Query('landlordId') landlordId?: string) {
    return this.propertiesService.findAll(req.user, landlordId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property' })
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property' })
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }

  @Get('amenities/list')
  @ApiOperation({ summary: 'Get all available amenities' })
  async getAmenities() {
    return this.propertiesService.getAmenities();
  }

  @Get(':id/images')
  @ApiOperation({ summary: 'Get property images' })
  async getPropertyImages(@Param('id') id: string) {
    return this.propertiesService.getPropertyImages(id);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add property image(s)' })
  async addPropertyImage(
    @Param('id') id: string,
    @Body() imageData: any | any[]
  ) {
    // Check if it's an array (batch) or single object
    if (Array.isArray(imageData)) {
      return this.propertiesService.addPropertyImagesBatch(id, imageData);
    } else {
      return this.propertiesService.addPropertyImage(id, imageData);
    }
  }

  @Patch(':id/images/:imageId')
  @ApiOperation({ summary: 'Update property image' })
  async updatePropertyImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() updateData: any
  ) {
    return this.propertiesService.updatePropertyImage(id, imageId, updateData);
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Delete property image' })
  async deletePropertyImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string
  ) {
    return this.propertiesService.deletePropertyImage(id, imageId);
  }
}

