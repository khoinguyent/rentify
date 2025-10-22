import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { FeeType } from '@rentify/db';

export class CreateLeaseFeeDto {
  @ApiProperty({ example: 'cuid-lease-id' })
  @IsString()
  leaseId: string;

  @ApiProperty({ example: 'Electricity' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'VARIABLE', enum: FeeType })
  @IsEnum(FeeType)
  type: FeeType;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ example: 0.15, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiProperty({ example: 'kWh', required: false })
  @IsOptional()
  @IsString()
  billingUnit?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

