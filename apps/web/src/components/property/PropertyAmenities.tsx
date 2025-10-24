import React from 'react';

interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

interface Property {
  amenities?: Amenity[];
}

interface PropertyAmenitiesProps {
  property: Property;
}

export function PropertyAmenities({ property }: PropertyAmenitiesProps) {
  if (!property.amenities || property.amenities.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Amenities</h2>
        <p className="text-gray-500">No amenities listed</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Amenities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {property.amenities.map((amenity) => (
          <div
            key={amenity.id}
            className="flex items-center gap-2 text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl">{amenity.icon || '🏡'}</span>
            <span className="text-sm">{amenity.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

