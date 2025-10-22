import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class RecordUsageDto {
  @ApiProperty({ example: 'cuid-fee-id' })
  @IsString()
  feeId: string;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @Min(0)
  usageValue: number;

  @ApiProperty({ example: '2025-10-01' })
  @IsDateString()
  periodMonth: string;

  @ApiProperty({ example: 'Meter reading: 12345', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkRecordUsageDto {
  @ApiProperty({
    example: [
      { feeId: 'fee-1', usageValue: 150.5, periodMonth: '2025-10-01' },
      { feeId: 'fee-2', usageValue: 25.3, periodMonth: '2025-10-01' },
    ],
  })
  usageData: Array<{
    feeId: string;
    usageValue: number;
    periodMonth: string;
  }>;
}

