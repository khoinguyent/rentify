import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { StorageModule } from '../storage/storage.module';
import { CacheService } from '../cache/cache.service';

@Module({
  imports: [StorageModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, CacheService],
  exports: [PropertiesService],
})
export class PropertiesModule {}

