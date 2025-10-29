import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageProvider } from './storage-provider.interface';
import { MinioStorageProvider } from './minio.provider';
import { S3StorageProvider } from './s3.provider';
import { R2StorageProvider } from './r2.provider';

export enum StorageProviderType {
  MINIO = 'minio',
  S3 = 's3',
  R2 = 'r2',
}

@Injectable()
export class StorageFactory {
  private readonly logger = new Logger(StorageFactory.name);
  
  constructor(private configService: ConfigService) {}

  createProvider(): IStorageProvider {
    const providerType = this.configService.get<StorageProviderType>(
      'STORAGE_PROVIDER',
      StorageProviderType.MINIO,
    );

    this.logger.log(`Creating storage provider: ${providerType}`);

    switch (providerType) {
      case StorageProviderType.S3:
        return new S3StorageProvider(this.configService);
      case StorageProviderType.R2:
        return new R2StorageProvider(this.configService);
      case StorageProviderType.MINIO:
      default:
        return new MinioStorageProvider(this.configService);
    }
  }
}

