import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUnitDto, UpdateUnitDto } from './dto';

@Injectable()
export class UnitsService {
  constructor(private readonly db: DatabaseService) {}

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

    return this.db.unit.update({
      where: { id },
      data: updateUnitDto,
      include: {
        property: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.db.unit.delete({
      where: { id },
    });

    return { message: 'Unit deleted successfully' };
  }
}

