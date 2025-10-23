import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { PropertyType } from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Sunset Apartments' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'APARTMENT', enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'San Francisco', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'CA', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '94102', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ example: 'US', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Modern apartment building', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2020, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  yearBuilt?: number;

  @ApiProperty({ example: 12, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalUnits?: number;
}

