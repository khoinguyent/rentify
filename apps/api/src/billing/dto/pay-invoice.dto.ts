import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';

export class PayInvoiceDto {
  @ApiProperty({ example: 2500.00 })
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @ApiProperty({ example: 'credit_card', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ example: '2025-10-22T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}

