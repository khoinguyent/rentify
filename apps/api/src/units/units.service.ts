import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../cache/cache.service';
import { CreateUnitDto, UpdateUnitDto } from './dto';

@Injectable()
export class UnitsService {
  constructor(private readonly db: DatabaseService, private readonly cache: CacheService) {}

  async create(createUnitDto: CreateUnitDto) {
    return this.db.unit.create({
      data: createUnitDto,
      include: {
        property: true,
      },
    });
  }

  async findAll(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};

    // Cache by propertyId only (when provided)
    if (propertyId) {
      const key = `units:${propertyId}`;
      const cached = await this.cache.get<any[]>(key);
      if (cached) return cached;
      const data = await this.db.unit.findMany({
        where,
        include: {
          property: true,
        },
      });
      await this.cache.set(key, data, 120);
      return data;
    }

    return this.db.unit.findMany({
      where,
      include: {
        property: true,
      },
    });
  }

  async findOne(id: string) {
    const unit = await this.db.unit.findUnique({
      where: { id },
      include: {
        property: true,
        leases: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    // Fetch unit images from object_documents
    const documents = await this.db.objectDocument.findMany({
      where: {
        objectType: 'Unit',
        objectId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Add images array to the unit object
    return {
      ...unit,
      images: documents.map(doc => ({
        id: doc.id,
        url: doc.url,
        fileName: doc.name,
      })),
    };
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    await this.findOne(id);

    const updated = await this.db.unit.update({
      where: { id },
      data: updateUnitDto,
      include: {
        property: true,
      },
    });
    // Invalidate property units cache
    try { await this.cache.del(`units:${updated.propertyId}`); } catch {}
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.db.unit.delete({
      where: { id },
    });

    return { message: 'Unit deleted successfully' };
  }
}

