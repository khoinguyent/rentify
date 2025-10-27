import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createDocument(data: {
    objectType: string;
    objectId: string;
    name: string;
    url: string;
    mimeType: string;
    size?: number;
    documentTypeId?: string;
    uploadedById?: string;
  }) {
    return this.databaseService.objectDocument.create({
      data: {
        objectType: data.objectType,
        objectId: data.objectId,
        name: data.name,
        url: data.url,
        mimeType: data.mimeType,
        size: data.size,
        documentTypeId: data.documentTypeId,
        uploadedById: data.uploadedById,
      },
    });
  }

  async getDocuments(objectType: string, objectId: string) {
    return this.databaseService.objectDocument.findMany({
      where: { objectType, objectId },
      include: { documentType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentTypes(objectType: string) {
    console.log('DocumentsService.getDocumentTypes called with objectType:', objectType);
    const result = await this.databaseService.documentType.findMany({
      where: {
        OR: [
          { objectTypes: { has: objectType } },
          { isShared: true },
        ],
      },
      orderBy: { name: 'asc' },
    });
    console.log('DocumentsService.getDocumentTypes result count:', result.length);
    return result;
  }

  async deleteDocument(id: string) {
    return this.databaseService.objectDocument.delete({
      where: { id },
    });
  }

  async getDocumentById(id: string) {
    return this.databaseService.objectDocument.findUnique({
      where: { id },
      include: { documentType: true },
    });
  }
}

