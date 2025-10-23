import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateLeaseDto {
  @ApiProperty({ example: 'cuid-property-id' })
  @IsString()
  propertyId: string;

  @ApiProperty({ example: 'cuid-unit-id' })
  @IsString()
  unitId: string;

  @ApiProperty({ example: 'cuid-tenant-profile-id' })
  @IsString()
  tenantId: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiProperty({ example: 1, required: false, description: 'Day of month for billing (1-31)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  billingDay?: number;

  @ApiProperty({ example: 1, enum: [1, 3, 6, 12], required: false, description: 'Billing cycle: 1=monthly, 3=quarterly, 6=semi-annual, 12=annual' })
  @IsOptional()
  @IsNumber()
  @IsEnum([1, 3, 6, 12])
  billingCycleMonths?: number;

  @ApiProperty({ example: 'PERCENT', enum: DiscountType, required: false })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiProperty({ example: 10, required: false, description: 'Discount value (percentage or fixed amount)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeAmount?: number;

  @ApiProperty({ example: 'Standard lease terms...', required: false })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ example: 'Additional notes...', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

