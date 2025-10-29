import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min, IsArray, IsBoolean, IsDateString, IsObject } from 'class-validator';

export enum UnitStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum Furnishing {
  FURNISHED = 'FURNISHED',
  SEMI_FURNISHED = 'SEMI_FURNISHED',
  UNFURNISHED = 'UNFURNISHED',
}

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

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  rent: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiProperty({ example: 75, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  areaSize?: number;

  @ApiProperty({ example: 75, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeM2?: number;

  @ApiProperty({ example: 'FURNISHED', enum: Furnishing, required: false })
  @IsOptional()
  @IsEnum(Furnishing)
  furnishing?: Furnishing;

  @ApiProperty({ 
    example: { waterIncluded: true, electricityIncluded: false }, 
    required: false 
  })
  @IsOptional()
  @IsObject()
  utilities?: Record<string, any>;

  @ApiProperty({ example: '2024-12-01', required: false })
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiProperty({ example: ['https://example.com/photo1.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiProperty({ example: 'AVAILABLE', enum: UnitStatus, required: false })
  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @ApiProperty({ example: 'Spacious unit with city view', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  // Additional fields used by web app (persisted to Unit model)
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  kitchen?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  balcony?: boolean;

  @ApiProperty({ example: ['amenity-id-1', 'amenity-id-2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}

