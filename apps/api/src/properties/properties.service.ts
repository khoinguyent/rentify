import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly storageService: StorageService,
  ) {}

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

    // Extract amenities from DTO
    const { amenities, ...propertyData } = createPropertyDto;

    // Convert date strings to proper DateTime format for Prisma
    if (propertyData.availableFrom) {
      propertyData.availableFrom = new Date(propertyData.availableFrom).toISOString();
    }

    // Create property with amenities
    const property = await this.db.property.create({
      data: {
        ...propertyData,
        landlordId: landlordProfile.id,
        amenities: amenities
          ? {
              create: amenities.map((amenityId) => ({
                amenity: {
                  connect: { id: amenityId },
                },
              })),
            }
          : undefined,
      },
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

    return property;
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
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
          ],
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        leases: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            tenant: true,
          },
          take: 1, // Only get the first active lease
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Regenerate URLs with localhost:9000 for browser access
    const imagesWithUpdatedUrls = await Promise.all(
      (property.images || []).map(async (image) => {
        try {
          // Always regenerate the URL using the storage service
          const newUrl = await this.storageService.getFileUrl(image.storageKey);
          return { ...image, url: newUrl };
        } catch (error) {
          console.error(`Failed to regenerate URL for image ${image.id}:`, error);
          return image; // Return original image if URL regeneration fails
        }
      })
    );

    // Transform amenities to flat structure and include activeTenant and activeLease if there's an active lease
    const activeLease = property.leases?.[0];
    const transformedProperty = {
      ...property,
      amenities: property.amenities?.map(pa => ({
        id: pa.amenity.id,
        name: pa.amenity.name,
        icon: pa.amenity.icon,
        description: pa.amenity.description,
      })) || [],
      photos: imagesWithUpdatedUrls, // Map images to photos for frontend compatibility
      activeTenant: activeLease?.tenant ? {
        id: activeLease.tenant.id,
        name: activeLease.tenant.fullName,
        email: activeLease.tenant.email,
        phone: activeLease.tenant.phone,
      } : undefined,
      activeLease: activeLease ? {
        id: activeLease.id,
        startDate: activeLease.startDate,
        endDate: activeLease.endDate,
        rentAmount: parseFloat(activeLease.rentAmount.toString()),
        documentUrl: activeLease.documentUrl,
        status: activeLease.status,
      } : undefined,
    };

    console.log(`Property ${id} amenities count:`, property.amenities?.length || 0);
    console.log(`Property ${id} transformed amenities:`, transformedProperty.amenities);

    return transformedProperty;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.findOne(id);

    // Extract amenities from DTO and handle separately
    const { amenities, ...propertyData } = updatePropertyDto;

    // Convert date strings to proper DateTime format for Prisma
    if (propertyData.availableFrom) {
      propertyData.availableFrom = new Date(propertyData.availableFrom).toISOString();
    }

    // Update property data
    const updatedProperty = await this.db.property.update({
      where: { id },
      data: propertyData,
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

    // Handle amenities update if provided
    if (amenities !== undefined) {
      // Remove existing amenities
      await this.db.propertyAmenity.deleteMany({
        where: { propertyId: id },
      });

      // Add new amenities
      if (amenities.length > 0) {
        await this.db.propertyAmenity.createMany({
          data: amenities.map(amenityId => ({
            propertyId: id,
            amenityId,
          })),
        });
      }

      // Return updated property with amenities
      return this.db.property.findUnique({
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
    }

    return updatedProperty;
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

  /**
   * Get all available amenities
   */
  async getAmenities() {
    return this.db.amenity.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get property images
   */
  async getPropertyImages(propertyId: string) {
    const images = await this.db.propertyImage.findMany({
      where: { propertyId },
      orderBy: [
        { isPrimary: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Regenerate URLs with localhost:9000 for browser access
    const imagesWithUpdatedUrls = await Promise.all(
      images.map(async (image) => {
        try {
          // Always regenerate the URL using the storage service
          const newUrl = await this.storageService.getFileUrl(image.storageKey);
          return { ...image, url: newUrl };
        } catch (error) {
          console.error(`Failed to regenerate URL for image ${image.id}:`, error);
          return image; // Return original image if URL regeneration fails
        }
      })
    );

    return imagesWithUpdatedUrls;
  }

  /**
   * Add property image
   */
  async addPropertyImage(propertyId: string, imageData: any) {
    // Verify property exists
    const property = await this.db.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Prepare data with proper field mapping
    const imageToCreate = {
      propertyId,
      fileName: imageData.fileName || `image_${Date.now()}`,
      originalName: imageData.originalName || 'Unknown',
      fileSize: imageData.fileSize || 0,
      mimeType: imageData.mimeType || 'image/jpeg',
      storageKey: imageData.storageKey || '',
      url: imageData.url || '',
      altText: imageData.altText || imageData.originalName || 'Property image',
      caption: imageData.caption || null,
      isPrimary: imageData.isPrimary || false,
      sortOrder: imageData.sortOrder || 0,
    };

    console.log(`Creating single image for property ${propertyId}:`, imageToCreate);

    return this.db.propertyImage.create({
      data: imageToCreate,
    });
  }

  /**
   * Add multiple property images in batch
   */
  async addPropertyImagesBatch(propertyId: string, imagesData: any[]) {
    // Verify property exists
    const property = await this.db.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Prepare data for batch insert
    const imagesToCreate = imagesData.map((imageData, index) => ({
      propertyId,
      fileName: imageData.fileName || `image_${Date.now()}_${index}`,
      originalName: imageData.originalName || 'Unknown',
      fileSize: imageData.fileSize || 0,
      mimeType: imageData.mimeType || 'image/jpeg',
      storageKey: imageData.storageKey || '',
      url: imageData.url || '',
      altText: imageData.altText || imageData.originalName || 'Property image',
      caption: imageData.caption || null,
      isPrimary: imageData.isPrimary || false,
      sortOrder: imageData.sortOrder || index,
    }));

    console.log(`Creating ${imagesToCreate.length} images for property ${propertyId}`);

    return this.db.propertyImage.createMany({
      data: imagesToCreate,
    });
  }

  /**
   * Update property image
   */
  async updatePropertyImage(propertyId: string, imageId: string, updateData: any) {
    // Verify image belongs to property
    const image = await this.db.propertyImage.findFirst({
      where: {
        id: imageId,
        propertyId,
      },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    return this.db.propertyImage.update({
      where: { id: imageId },
      data: updateData,
    });
  }

  /**
   * Delete property image
   */
  async deletePropertyImage(propertyId: string, imageId: string) {
    // Verify image belongs to property
    const image = await this.db.propertyImage.findFirst({
      where: {
        id: imageId,
        propertyId,
      },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    return this.db.propertyImage.delete({
      where: { id: imageId },
    });
  }
}

