import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  addDays,
  isBefore,
  isAfter,
  differenceInMonths,
  format,
} from 'date-fns';

@Injectable()
export class BillingService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Generate invoices for all active leases that are due for billing today
   */
  async generateInvoicesForToday() {
    const today = new Date();
    const currentDay = today.getDate();

    // Find active leases where today is the billing day
    const leasesToBill = await this.db.leaseContract.findMany({
      where: {
        status: 'ACTIVE',
        billingDay: currentDay,
      },
      include: {
        invoices: {
          orderBy: {
            periodEnd: 'desc',
          },
          take: 1,
        },
        fees: {
          where: {
            isActive: true,
          },
        },
      },
    });

    const results = [];

    for (const lease of leasesToBill) {
      try {
        // Check if we should generate an invoice
        const lastInvoice = lease.invoices[0];
        
        if (lastInvoice) {
          const monthsSinceLastInvoice = differenceInMonths(today, lastInvoice.periodEnd);
          
          // Only generate if enough months have passed
          if (monthsSinceLastInvoice < lease.billingCycleMonths) {
            continue;
          }
        }

        const invoice = await this.generateInvoiceForLease(lease.id);
        results.push(invoice);
      } catch (error) {
        console.error(`Failed to generate invoice for lease ${lease.id}:`, error);
      }
    }

    return {
      generated: results.length,
      invoices: results,
    };
  }

  /**
   * Generate an invoice for a specific lease
   */
  async generateInvoiceForLease(leaseId: string, customPeriod?: { start: Date; end: Date }) {
    const lease = await this.db.leaseContract.findUnique({
      where: { id: leaseId },
      include: {
        fees: {
          where: {
            isActive: true,
          },
        },
        invoices: {
          orderBy: {
            periodEnd: 'desc',
          },
          take: 1,
        },
        usageRecords: true,
      },
    });

    if (!lease) {
      throw new NotFoundException('Lease contract not found');
    }

    if (lease.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot generate invoice for inactive lease');
    }

    // Calculate billing period
    const { periodStart, periodEnd } = customPeriod
      ? customPeriod
      : this.calculatePeriodRange(lease, lease.invoices[0]);

    // Check for duplicate invoice
    const existingInvoice = await this.db.invoice.findFirst({
      where: {
        leaseId,
        periodStart,
        periodEnd,
      },
    });

    if (existingInvoice) {
      throw new BadRequestException('Invoice for this period already exists');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate invoice items
    const items = [];
    let subtotal = new Decimal(0);

    // 1. Add Rent (multiply by billing cycle months)
    const rentAmount = new Decimal(lease.rentAmount).times(lease.billingCycleMonths);
    items.push({
      type: 'RENT',
      name: 'Rent',
      description: `Rent for ${format(periodStart, 'MMM yyyy')} - ${format(periodEnd, 'MMM yyyy')}`,
      quantity: new Decimal(lease.billingCycleMonths),
      unitPrice: new Decimal(lease.rentAmount),
      amount: rentAmount,
      periodStart,
      periodEnd,
    });
    subtotal = subtotal.plus(rentAmount);

    // 2. Add Fixed Fees (multiply by billing cycle months)
    for (const fee of lease.fees) {
      if (fee.type === 'FIXED' && fee.amount) {
        const feeAmount = new Decimal(fee.amount).times(lease.billingCycleMonths);
        items.push({
          feeId: fee.id,
          type: 'FIXED_FEE',
          name: fee.name,
          description: `${fee.name} for billing period`,
          quantity: new Decimal(lease.billingCycleMonths),
          unitPrice: new Decimal(fee.amount),
          amount: feeAmount,
          periodStart,
          periodEnd,
        });
        subtotal = subtotal.plus(feeAmount);
      }
    }

    // 3. Add Variable Fees (based on usage records)
    for (const fee of lease.fees) {
      if (fee.type === 'VARIABLE' && fee.unitPrice) {
        const usageRecords = await this.db.usageRecord.findMany({
          where: {
            feeId: fee.id,
            periodMonth: {
              gte: startOfMonth(periodStart),
              lte: startOfMonth(periodEnd),
            },
          },
        });

        let totalUsage = new Decimal(0);
        let totalAmount = new Decimal(0);

        for (const record of usageRecords) {
          totalUsage = totalUsage.plus(new Decimal(record.usageValue));
          totalAmount = totalAmount.plus(new Decimal(record.totalAmount));
        }

        if (totalUsage.greaterThan(0)) {
          items.push({
            feeId: fee.id,
            type: 'VARIABLE_FEE',
            name: fee.name,
            description: `${fee.name} - ${totalUsage.toString()} ${fee.billingUnit}`,
            quantity: totalUsage,
            unitPrice: new Decimal(fee.unitPrice),
            amount: totalAmount,
            periodStart,
            periodEnd,
          });
          subtotal = subtotal.plus(totalAmount);
        }
      }
    }

    // 4. Apply Discount
    let discountAmount = new Decimal(0);
    if (lease.discountType && lease.discountValue) {
      discountAmount = this.calculateDiscount(subtotal, lease.discountType, lease.discountValue);

      if (discountAmount.greaterThan(0)) {
        items.push({
          type: 'DISCOUNT',
          name: `Discount (${lease.discountType === 'PERCENT' ? `${lease.discountValue}%` : `$${lease.discountValue}`})`,
          description: `Discount applied to invoice`,
          quantity: new Decimal(1),
          unitPrice: discountAmount.negated(),
          amount: discountAmount.negated(),
          periodStart,
          periodEnd,
        });
      }
    }

    const totalAmount = subtotal.minus(discountAmount);

    // Calculate due date (e.g., 7 days from issue date)
    const dueDate = addDays(new Date(), 7);

    // Create invoice
    const invoice = await this.db.invoice.create({
      data: {
        leaseId,
        invoiceNumber,
        periodStart,
        periodEnd,
        dueDate,
        subtotal,
        discountAmount,
        taxAmount: new Decimal(0),
        totalAmount,
        status: 'UNPAID',
        items: {
          create: items,
        },
      },
      include: {
        items: true,
        lease: {
          include: {
            tenant: true,
            property: true,
            unit: true,
          },
        },
      },
    });

    return invoice;
  }

  /**
   * Calculate the billing period range
   */
  private calculatePeriodRange(
    lease: any,
    lastInvoice?: any
  ): { periodStart: Date; periodEnd: Date } {
    let periodStart: Date;

    if (lastInvoice) {
      // Start from the day after last invoice ended
      periodStart = addDays(lastInvoice.periodEnd, 1);
    } else {
      // First invoice - start from lease start date
      periodStart = startOfMonth(lease.startDate);
    }

    // Calculate period end based on billing cycle
    const periodEnd = endOfMonth(addMonths(periodStart, lease.billingCycleMonths - 1));

    // Don't exceed lease end date
    if (isAfter(periodEnd, lease.endDate)) {
      return {
        periodStart,
        periodEnd: lease.endDate,
      };
    }

    return {
      periodStart,
      periodEnd,
    };
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(
    subtotal: Decimal,
    discountType: string,
    discountValue: any
  ): Decimal {
    const value = new Decimal(discountValue);

    if (discountType === 'PERCENT') {
      // Percentage discount
      return subtotal.times(value).dividedBy(100);
    } else if (discountType === 'FIXED') {
      // Fixed amount discount
      return value;
    }

    return new Decimal(0);
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Count invoices this month
    const count = await this.db.invoice.count({
      where: {
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(invoiceId: string, paidAmount: number, paymentMethod?: string) {
    const invoice = await this.db.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    return this.db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paidAmount: new Decimal(paidAmount),
        paymentMethod,
      },
      include: {
        items: true,
        lease: {
          include: {
            tenant: true,
            property: true,
          },
        },
      },
    });
  }

  /**
   * Get all invoices for a lease
   */
  async getInvoicesForLease(leaseId: string) {
    return this.db.invoice.findMany({
      where: { leaseId },
      include: {
        items: true,
      },
      orderBy: {
        periodStart: 'desc',
      },
    });
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string) {
    const invoice = await this.db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          include: {
            fee: true,
          },
        },
        lease: {
          include: {
            tenant: true,
            landlord: true,
            property: true,
            unit: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * Update overdue invoices
   */
  async updateOverdueInvoices() {
    const now = new Date();

    const result = await this.db.invoice.updateMany({
      where: {
        status: 'UNPAID',
        dueDate: {
          lt: now,
        },
      },
      data: {
        status: 'OVERDUE',
      },
    });

    return {
      updated: result.count,
    };
  }
}

