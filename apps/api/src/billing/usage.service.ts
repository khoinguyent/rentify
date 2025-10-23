import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Decimal } from '@prisma/client/runtime/library';
import { startOfMonth } from 'date-fns';

@Injectable()
export class UsageService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Record usage for a variable fee
   */
  async recordUsage(leaseId: string, feeId: string, usageValue: number, periodMonth: Date) {
    // Verify lease exists
    const lease = await this.db.leaseContract.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      throw new NotFoundException('Lease contract not found');
    }

    // Verify fee exists and is variable
    const fee = await this.db.leaseFee.findUnique({
      where: { id: feeId },
    });

    if (!fee) {
      throw new NotFoundException('Fee not found');
    }

    if (fee.type !== 'VARIABLE') {
      throw new BadRequestException('Can only record usage for variable fees');
    }

    if (!fee.unitPrice) {
      throw new BadRequestException('Variable fee must have a unit price');
    }

    // Calculate total amount
    const totalAmount = new Decimal(usageValue).times(new Decimal(fee.unitPrice));

    // Normalize period to start of month
    const normalizedPeriod = startOfMonth(periodMonth);

    // Create or update usage record
    const existingRecord = await this.db.usageRecord.findUnique({
      where: {
        leaseId_feeId_periodMonth: {
          leaseId,
          feeId,
          periodMonth: normalizedPeriod,
        },
      },
    });

    if (existingRecord) {
      return this.db.usageRecord.update({
        where: { id: existingRecord.id },
        data: {
          usageValue: new Decimal(usageValue),
          totalAmount,
        },
        include: {
          fee: true,
        },
      });
    }

    return this.db.usageRecord.create({
      data: {
        leaseId,
        feeId,
        periodMonth: normalizedPeriod,
        usageValue: new Decimal(usageValue),
        totalAmount,
      },
      include: {
        fee: true,
      },
    });
  }

  /**
   * Get usage records for a lease in a specific period
   */
  async getUsageForPeriod(leaseId: string, periodStart: Date, periodEnd: Date) {
    return this.db.usageRecord.findMany({
      where: {
        leaseId,
        periodMonth: {
          gte: startOfMonth(periodStart),
          lte: startOfMonth(periodEnd),
        },
      },
      include: {
        fee: true,
      },
      orderBy: {
        periodMonth: 'desc',
      },
    });
  }

  /**
   * Get usage records for a specific fee
   */
  async getUsageForFee(feeId: string, limit?: number) {
    return this.db.usageRecord.findMany({
      where: {
        feeId,
      },
      include: {
        fee: true,
        lease: {
          include: {
            tenant: true,
            unit: true,
          },
        },
      },
      orderBy: {
        periodMonth: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get all usage records for a lease
   */
  async getUsageForLease(leaseId: string) {
    return this.db.usageRecord.findMany({
      where: {
        leaseId,
      },
      include: {
        fee: true,
      },
      orderBy: {
        periodMonth: 'desc',
      },
    });
  }

  /**
   * Delete a usage record
   */
  async deleteUsageRecord(usageRecordId: string) {
    const record = await this.db.usageRecord.findUnique({
      where: { id: usageRecordId },
    });

    if (!record) {
      throw new NotFoundException('Usage record not found');
    }

    await this.db.usageRecord.delete({
      where: { id: usageRecordId },
    });

    return { message: 'Usage record deleted successfully' };
  }

  /**
   * Bulk record usage for multiple fees
   */
  async bulkRecordUsage(
    leaseId: string,
    usageData: Array<{
      feeId: string;
      usageValue: number;
      periodMonth: Date;
    }>
  ) {
    const results: any[] = [];

    for (const data of usageData) {
      try {
        const record = await this.recordUsage(
          leaseId,
          data.feeId,
          data.usageValue,
          data.periodMonth
        );
        results.push(record);
      } catch (error) {
        console.error(`Failed to record usage for fee ${data.feeId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get usage summary for a lease
   */
  async getUsageSummary(leaseId: string, periodStart: Date, periodEnd: Date) {
    const records = await this.getUsageForPeriod(leaseId, periodStart, periodEnd);

    // Group by fee
    const summary = records.reduce((acc, record) => {
      const feeId = record.feeId;

      if (!acc[feeId]) {
        acc[feeId] = {
          fee: record.fee,
          totalUsage: new Decimal(0),
          totalAmount: new Decimal(0),
          records: [],
        };
      }

      acc[feeId].totalUsage = acc[feeId].totalUsage.plus(new Decimal(record.usageValue));
      acc[feeId].totalAmount = acc[feeId].totalAmount.plus(new Decimal(record.totalAmount));
      acc[feeId].records.push(record);

      return acc;
    }, {});

    return Object.values(summary);
  }
}

