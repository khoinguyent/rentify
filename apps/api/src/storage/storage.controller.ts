import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string = 'general',
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    return this.storageService.uploadFile(file, folder);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder: string = 'general',
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    return this.storageService.uploadMultipleFiles(files, folder);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file by key' })
  async deleteFile(@Param('key') key: string) {
    await this.storageService.deleteFile(key);
    return { message: 'File deleted successfully' };
  }

  @Delete('multiple')
  @ApiOperation({ summary: 'Delete multiple files' })
  async deleteMultipleFiles(@Query('keys') keys: string) {
    const keyArray = keys.split(',');
    await this.storageService.deleteMultipleFiles(keyArray);
    return { message: 'Files deleted successfully' };
  }

  @Get('url/:key')
  @ApiOperation({ summary: 'Get presigned URL for a file' })
  async getFileUrl(@Param('key') key: string) {
    const url = await this.storageService.getFileUrl(key);
    return { url };
  }

  @Get('presigned/:key')
  @ApiOperation({ summary: 'Get presigned URL for internal use' })
  async getPresignedUrl(@Param('key') key: string) {
    const url = await this.storageService.getPresignedUrl(key);
    return { url };
  }

  @Get('list')
  @ApiOperation({ summary: 'List files in a folder' })
  async listFiles(
    @Query('folder') folder: string = '',
    @Query('prefix') prefix: string = '',
  ) {
    const files = await this.storageService.listFiles(folder, prefix);
    return { files };
  }

  @Get('exists/:key')
  @ApiOperation({ summary: 'Check if a file exists' })
  async fileExists(@Param('key') key: string) {
    const exists = await this.storageService.fileExists(key);
    return { exists };
  }
}
