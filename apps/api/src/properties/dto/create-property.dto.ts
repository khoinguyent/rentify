import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, Min, IsArray, IsBoolean, IsDateString } from 'class-validator';

export enum PropertyType {
  STUDIO = 'STUDIO',
  ONE_BEDROOM = 'ONE_BEDROOM',
  TWO_BEDROOM = 'TWO_BEDROOM',
  THREE_BEDROOM = 'THREE_BEDROOM',
  DUPLEX = 'DUPLEX',
  VILLA = 'VILLA',
  TOWNHOUSE = 'TOWNHOUSE',
  CONDO = 'CONDO',
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  PENTHOUSE = 'PENTHOUSE',
  LOFT = 'LOFT',
  SERVICED_APARTMENT = 'SERVICED_APARTMENT',
  COMMERCIAL = 'COMMERCIAL',
  OFFICE = 'OFFICE',
  WAREHOUSE = 'WAREHOUSE',
  LAND = 'LAND',
}

export enum Furnishing {
  FURNISHED = 'FURNISHED',
  SEMI_FURNISHED = 'SEMI_FURNISHED',
  UNFURNISHED = 'UNFURNISHED',
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  COMING_SOON = 'COMING_SOON',
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Sunset Apartments' })
  @IsString()
  name: string;

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

  @ApiProperty({ example: 37.7749, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -122.4194, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 'APARTMENT', enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ example: 'FURNISHED', enum: Furnishing, required: false })
  @IsOptional()
  @IsEnum(Furnishing)
  furnishing?: Furnishing;

  @ApiProperty({ example: 120, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  floorArea?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  floorLevel?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  numBedrooms?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  numBathrooms?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  parkingSpaces?: number;

  @ApiProperty({ example: 2020, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  yearBuilt?: number;

  @ApiProperty({ example: '2024-12-01', required: false })
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiProperty({ example: 'AVAILABLE', enum: PropertyStatus, required: false })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiProperty({ example: 'Modern apartment building', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2800, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rentalPrice?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  hasMultipleUnits?: boolean;

  @ApiProperty({ example: 12, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalUnits?: number;

  @ApiProperty({ example: ['wifi', 'gym'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty({ example: ['https://example.com/photo1.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiProperty({ example: 'https://example.com/video-tour', required: false })
  @IsOptional()
  @IsString()
  videoTourUrl?: string;

  @ApiProperty({ example: 'https://example.com/virtual-tour', required: false })
  @IsOptional()
  @IsString()
  virtualTourUrl?: string;

  @ApiProperty({ example: ['luxury', 'downtown'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

