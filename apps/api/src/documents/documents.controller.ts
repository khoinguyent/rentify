import { Controller, Post, Get, Delete, Param, UploadedFile, UseInterceptors, Body, UseGuards, Request, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { uploadToMinio, deleteFromMinio } from '../storage/minio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        objectType: { type: 'string' },
        objectId: { type: 'string' },
        documentTypeId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { objectType: string; objectId: string; documentTypeId?: string },
    @Request() req: any,
  ) {
    const { objectType, objectId, documentTypeId } = body;
    const folder = `${objectType.toLowerCase()}s/${objectId}`;
    
    if (!file) {
      throw new Error('No file uploaded');
    }

    const url = await uploadToMinio(file, folder);

    return this.documentsService.createDocument({
      objectType,
      objectId,
      url,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      documentTypeId: documentTypeId || undefined,
      uploadedById: req.user.id,
    });
  }

  @Get('types/:objectType')
  @ApiOperation({ summary: 'Get document types for an object type' })
  @ApiResponse({ status: 200, description: 'Document types retrieved successfully' })
  async listTypes(@Param('objectType') objectType: string) {
    console.log('DocumentsController.listTypes called with objectType:', objectType);
    const result = await this.documentsService.getDocumentTypes(objectType);
    console.log('DocumentsController.listTypes returning:', result.length, 'types');
    return result;
  }

  @Get(':objectType/:objectId')
  @ApiOperation({ summary: 'Get documents for an object' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async listDocuments(@Param('objectType') objectType: string, @Param('objectId') objectId: string) {
    return this.documentsService.getDocuments(objectType, objectId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a document record' })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  async createDocument(
    @Body() body: {
      objectType: string;
      objectId: string;
      name: string;
      url: string;
      fileUrl?: string;
      mimeType: string;
      size?: number;
      documentTypeId?: string;
    },
    @Request() req: any,
  ) {
    return this.documentsService.createDocument({
      objectType: body.objectType,
      objectId: body.objectId,
      url: body.url,
      fileUrl: body.fileUrl,
      name: body.name,
      mimeType: body.mimeType,
      size: body.size,
      documentTypeId: body.documentTypeId || undefined,
      uploadedById: req.user.id,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  async remove(@Param('id') id: string) {
    const document = await this.documentsService.getDocumentById(id);
    
    if (document) {
      // Extract object name from URL
      const url = new URL(document.url);
      const objectName = url.pathname.substring(1); // Remove leading /
      await deleteFromMinio(objectName);
    }
    
    return this.documentsService.deleteDocument(id);
  }
}

