import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DatabaseModule } from '../database/database.module';
import { PropertiesModule } from '../properties/properties.module';
import { LeasesModule } from '../leases/leases.module';
import { BillingModule } from '../billing/billing.module';
import { MaintenanceModule } from '../maintenance/maintenance.module';

@Module({
  imports: [
    DatabaseModule,
    PropertiesModule,
    LeasesModule,
    BillingModule,
    MaintenanceModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
