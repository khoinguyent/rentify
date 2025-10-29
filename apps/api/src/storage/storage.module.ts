import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { StorageFactory } from './providers/storage.factory';

@Module({
  controllers: [StorageController],
  providers: [StorageService, StorageFactory],
  exports: [StorageService, StorageFactory],
})
export class StorageModule {}
