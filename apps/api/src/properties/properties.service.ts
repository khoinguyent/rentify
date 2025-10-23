import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createPropertyDto: CreatePropertyDto, userId: string) {
    // Get or create landlord profile
    let landlordProfile = await this.db.landlordProfile.findUnique({
      where: { userId },
    });

    if (!landlordProfile) {
      const user = await this.db.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      landlordProfile = await this.db.landlordProfile.create({
        data: {
          userId,
          name: `${user.firstName} ${user.lastName}`,
        },
      });
    }

    return this.db.property.create({
      data: {
        ...createPropertyDto,
        landlordId: landlordProfile.id,
      },
      include: {
        landlord: true,
        units: true,
      },
    });
  }

  async findAll(user: any, landlordId?: string) {
    const where: any = {};

    if (user.role === 'LANDLORD') {
      const landlordProfile = await this.db.landlordProfile.findUnique({
        where: { userId: user.id },
      });
      if (landlordProfile) {
        where.landlordId = landlordProfile.id;
      }
    } else if (landlordId) {
      where.landlordId = landlordId;
    }

    return this.db.property.findMany({
      where,
      include: {
        landlord: true,
        units: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const property = await this.db.property.findUnique({
      where: { id },
      include: {
        landlord: true,
        units: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.findOne(id);

    return this.db.property.update({
      where: { id },
      data: updatePropertyDto,
      include: {
        landlord: true,
        units: true,
      },
    });
  }

  async remove(id: string) {
    const property = await this.findOne(id);

    await this.db.property.delete({
      where: { id },
    });

    return { message: 'Property deleted successfully' };
  }

  /**
   * Get properties by landlord ID for dashboard
   */
  async getPropertiesByLandlord(landlordId: string) {
    return this.db.property.findMany({
      where: { landlordId },
      include: {
        units: true,
        landlord: true,
      },
    });
  }

  /**
   * Get vacant units for a landlord
   */
  async getVacantUnitsByLandlord(landlordId: string) {
    return this.db.unit.findMany({
      where: {
        property: { landlordId },
        status: 'AVAILABLE',
      },
      include: {
        property: true,
      },
    });
  }
}

