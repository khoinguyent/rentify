import React from 'react';

interface Property {
  type?: string;
  furnishing?: string;
  numBedrooms?: number;
  numBathrooms?: number;
  floorArea?: number;
  rentalPrice?: number;
  parkingSpaces?: number;
  availableFrom?: string;
}

interface PropertyOverviewProps {
  property: Property;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {property.type && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Type</p>
            <p className="text-gray-800 font-medium">{property.type}</p>
          </div>
        )}
        {property.furnishing && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Furnishing</p>
            <p className="text-gray-800 font-medium">{property.furnishing}</p>
          </div>
        )}
        {property.numBedrooms !== undefined && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Bedrooms</p>
            <p className="text-gray-800 font-medium">{property.numBedrooms}</p>
          </div>
        )}
        {property.numBathrooms !== undefined && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Bathrooms</p>
            <p className="text-gray-800 font-medium">{property.numBathrooms}</p>
          </div>
        )}
        {property.floorArea && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Area</p>
            <p className="text-gray-800 font-medium">{property.floorArea} m²</p>
          </div>
        )}
        {property.rentalPrice && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Rent</p>
            <p className="text-gray-800 font-medium">${property.rentalPrice.toLocaleString()}/mo</p>
          </div>
        )}
        {property.parkingSpaces !== undefined && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Parking</p>
            <p className="text-gray-800 font-medium">{property.parkingSpaces} spaces</p>
          </div>
        )}
        {property.availableFrom && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Available From</p>
            <p className="text-gray-800 font-medium">{formatDate(property.availableFrom)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

