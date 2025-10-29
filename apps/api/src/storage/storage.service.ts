import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageProvider, UploadResult } from './providers/storage-provider.interface';
import { StorageFactory } from './providers/storage.factory';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private storageProvider: IStorageProvider;

  constructor(
    private configService: ConfigService,
    private storageFactory: StorageFactory,
  ) {
    this.storageProvider = this.storageFactory.createProvider();
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<UploadResult> {
    return this.storageProvider.uploadFile(file, folder);
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'general',
  ): Promise<UploadResult[]> {
    return this.storageProvider.uploadMultipleFiles(files, folder);
  }

  async deleteFile(objectName: string): Promise<void> {
    return this.storageProvider.deleteFile(objectName);
  }

  async deleteMultipleFiles(objectNames: string[]): Promise<void> {
    return this.storageProvider.deleteMultipleFiles(objectNames);
  }

  async getFileUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    return this.storageProvider.getFileUrl(objectName, expiry);
  }

  async getPresignedUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    return this.storageProvider.getPresignedUrl(objectName, expiry);
  }

  async getFileUrls(objectNames: string[], expiry: number = 7 * 24 * 60 * 60): Promise<string[]> {
    const urlPromises = objectNames.map((objectName) => this.getFileUrl(objectName, expiry));
    return Promise.all(urlPromises);
  }

  async listFiles(folder: string = '', prefix: string = ''): Promise<string[]> {
    return this.storageProvider.listFiles(folder, prefix);
  }

  async fileExists(objectName: string): Promise<boolean> {
    return this.storageProvider.fileExists(objectName);
  }
}
