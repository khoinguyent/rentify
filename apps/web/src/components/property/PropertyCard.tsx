import React from 'react';
import Link from 'next/link';
import PropertyStatusBadge from './PropertyStatusBadge';

interface Property {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  rentalPrice?: number;
  status: string;
  type?: string;
  propertyType?: string;
  numBedrooms?: number;
  numBathrooms?: number;
  floorArea?: number;
  hasMultipleUnits?: boolean;
  totalUnits?: number;
  photos?: string[];
  imageUrl?: string;
}

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const imageUrl = property.photos?.[0] || property.imageUrl || '/house.svg';
  const fullAddress = `${property.address}${property.city ? `, ${property.city}` : ''}${property.state ? `, ${property.state}` : ''}`;

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={property.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/house.svg';
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">{property.name}</h2>
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{fullAddress}</p>
        
        {/* Property Details */}
        {(property.numBedrooms || property.numBathrooms || property.floorArea) && (
          <p className="text-gray-700 text-sm mb-3">
            {property.numBedrooms && `${property.numBedrooms}BR`}
            {property.numBedrooms && property.numBathrooms && ' · '}
            {property.numBathrooms && `${property.numBathrooms}BA`}
            {property.floorArea && ` · ${property.floorArea}m²`}
          </p>
        )}

        {/* Price and Status */}
        <div className="flex justify-between items-center mb-3">
          {property.rentalPrice && (
            <span className="text-[#5BA0A4] font-semibold text-lg">
              ${property.rentalPrice.toLocaleString()}/mo
            </span>
          )}
          <PropertyStatusBadge status={property.status} />
        </div>

        {/* Units Available */}
        {property.hasMultipleUnits && property.totalUnits && (
          <p className="text-xs text-gray-500 mb-3">
            {property.totalUnits} {property.totalUnits === 1 ? 'Unit' : 'Units'} Total
          </p>
        )}

        {/* View Details Button */}
        <Link
          href={`/properties/${property.id}`}
          className="mt-auto bg-gray-100 hover:bg-gray-200 text-sm py-2 rounded-md text-center text-gray-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

