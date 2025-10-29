import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { CacheService } from '../cache/cache.service';

@Module({
  controllers: [UnitsController],
  providers: [UnitsService, CacheService],
})
export class UnitsModule {}

