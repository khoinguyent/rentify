import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { UnitStatus } from '@rentify/db';

export class CreateUnitDto {
  @ApiProperty({ example: 'cuid-property-id' })
  @IsString()
  propertyId: string;

  @ApiProperty({ example: 'Unit 101' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @ApiProperty({ example: 75, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeM2?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiProperty({ example: 'AVAILABLE', enum: UnitStatus, required: false })
  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @ApiProperty({ example: 'Spacious unit with city view', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

