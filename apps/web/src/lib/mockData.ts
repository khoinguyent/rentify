export interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export interface Unit {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  available: boolean;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  rentalPrice?: number;
  status: string;
  propertyType?: string;
  furnishing?: string;
  numBedrooms?: number;
  numBathrooms?: number;
  floorArea?: number;
  parkingSpaces?: number;
  availableFrom?: string;
  hasMultipleUnits?: boolean;
  totalUnits?: number;
  amenities?: Amenity[];
  units?: Unit[];
  photos?: string[];
  imageUrl?: string;
  description?: string;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const properties = await getProperties();
  return properties.find((p) => p.id === id) || null;
}

export async function getProperties(): Promise<Property[]> {
  // Mock data - will be replaced with API call
  return [
    {
      id: 'p1',
      name: 'Sunset Apartments',
      address: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      latitude: 37.7749,
      longitude: -122.4194,
      rentalPrice: 2800,
      status: 'AVAILABLE',
      propertyType: 'APARTMENT',
      furnishing: 'FURNISHED',
      numBedrooms: 3,
      numBathrooms: 2,
      floorArea: 120,
      parkingSpaces: 2,
      availableFrom: '2024-12-01',
      hasMultipleUnits: true,
      totalUnits: 5,
      amenities: [
        { id: 'wifi', name: 'Wi-Fi', icon: '📶' },
        { id: 'ac', name: 'Air Conditioning', icon: '❄️' },
        { id: 'parking', name: 'Parking', icon: '🅿️' },
        { id: 'pool', name: 'Swimming Pool', icon: '🏊' },
      ],
      units: [
        { id: 'u1', name: 'Unit 101', bedrooms: 2, bathrooms: 1, rent: 2500, available: true },
        { id: 'u2', name: 'Unit 102', bedrooms: 1, bathrooms: 1, rent: 2200, available: true },
        { id: 'u3', name: 'Unit 201', bedrooms: 3, bathrooms: 2, rent: 3000, available: false },
        { id: 'u4', name: 'Unit 202', bedrooms: 2, bathrooms: 2, rent: 2800, available: true },
        { id: 'u5', name: 'Unit 301', bedrooms: 3, bathrooms: 2, rent: 3200, available: true },
      ],
      photos: [
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800',
        'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      ],
      description: 'Modern apartments in the heart of the city. Located in a prime San Francisco neighborhood with easy access to public transportation, shopping, and dining. The building features a rooftop deck with stunning city views, fitness center, and 24/7 security.',
    },
    {
      id: 'p2',
      name: 'Downtown Plaza',
      address: '789 Market Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      rentalPrice: 3500,
      status: 'RENTED',
      propertyType: 'APARTMENT',
      numBedrooms: 2,
      numBathrooms: 2,
      floorArea: 85,
      hasMultipleUnits: true,
      totalUnits: 8,
      photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    },
    {
      id: 'p3',
      name: 'Garden Heights',
      address: '321 Pine Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      rentalPrice: 3000,
      status: 'AVAILABLE',
      propertyType: 'HOUSE',
      numBedrooms: 4,
      numBathrooms: 3,
      floorArea: 140,
      hasMultipleUnits: true,
      totalUnits: 3,
      photos: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
    },
    {
      id: 'p4',
      name: 'Skyline Duplex',
      address: '123 Riverside Ave',
      city: 'Singapore',
      country: 'SG',
      rentalPrice: 3200,
      status: 'AVAILABLE',
      propertyType: 'DUPLEX',
      numBedrooms: 3,
      numBathrooms: 2,
      floorArea: 150,
      photos: ['https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800'],
    },
    {
      id: 'p5',
      name: 'Ocean View Studio',
      address: '45 Marina Bay Rd',
      city: 'Singapore',
      country: 'SG',
      rentalPrice: 1800,
      status: 'UNDER_MAINTENANCE',
      propertyType: 'STUDIO',
      numBedrooms: 1,
      numBathrooms: 1,
      floorArea: 45,
      photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    },
    {
      id: 'p6',
      name: 'Urban Loft',
      address: '99 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'US',
      rentalPrice: 4200,
      status: 'COMING_SOON',
      propertyType: 'LOFT',
      numBedrooms: 2,
      numBathrooms: 1,
      floorArea: 90,
      photos: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
    },
  ];
}

