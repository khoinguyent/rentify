import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GenerateInvoiceDto {
  @ApiProperty({ example: '2025-01-01', required: false })
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @ApiProperty({ example: '2025-03-31', required: false })
  @IsOptional()
  @IsDateString()
  periodEnd?: string;
}

