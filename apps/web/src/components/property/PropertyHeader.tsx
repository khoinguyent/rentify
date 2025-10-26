import React from 'react';
import { MapPin, Bed, Bath, ChefHat, Car, Edit } from 'lucide-react';
import Link from 'next/link';
import PropertyStatusBadge from './PropertyStatusBadge';

interface Property {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  status: string;
  type: string;
  furnishing?: string;
  numBedrooms?: number;
  numBathrooms?: number;
  rentalPrice?: number;
  parkingSpaces?: number;
  description?: string;
}

interface PropertyHeaderProps {
  property: Property;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const formatPrice = (price?: number) => {
    if (!price) return 'Price not available';
    return `$${price.toLocaleString()}/month`;
  };

  const formatAddress = () => {
    const parts = [property.address];
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    if (property.country) parts.push(property.country);
    return parts.join(', ');
  };

  return (
    <div>
      {/* Property Name and Edit Button */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2">
            {property.name}
          </h1>
          <p className="text-sm uppercase tracking-wider text-[#64748B] font-semibold">
            PROPERTY DETAILS
          </p>
        </div>
        <Link
          href={`/properties/${property.id}/edit`}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E90FF] text-white rounded-xl hover:bg-[#1a80e6] transition-all shadow-md hover:shadow-lg font-medium"
        >
          <Edit size={18} />
          <span>Edit Property</span>
        </Link>
      </div>

      {/* Status and Type Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <PropertyStatusBadge status={property.status} />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg">
          <MapPin size={14} className="text-[#5BA0A4]" />
          <span className="text-sm font-medium text-gray-600 capitalize">{property.type?.toLowerCase()}</span>
        </div>
        {property.furnishing && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg">
            <span className="text-sm font-medium text-gray-600 capitalize">{property.furnishing.toLowerCase()}</span>
          </div>
        )}
      </div>

      {/* Property Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {property.numBedrooms !== undefined && (
          <div className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
            <Bed size={24} className="text-[#5BA0A4]" />
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wide font-semibold mb-0.5">Bedrooms</p>
              <p className="text-lg font-bold text-[#1E293B]">{property.numBedrooms}</p>
            </div>
          </div>
        )}
        
        {property.numBathrooms !== undefined && (
          <div className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
            <Bath size={24} className="text-[#5BA0A4]" />
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wide font-semibold mb-0.5">Bathrooms</p>
              <p className="text-lg font-bold text-[#1E293B]">{property.numBathrooms}</p>
            </div>
          </div>
        )}

        {property.parkingSpaces !== undefined && property.parkingSpaces > 0 && (
          <div className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
            <Car size={24} className="text-[#5BA0A4]" />
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wide font-semibold mb-0.5">Parking</p>
              <p className="text-lg font-bold text-[#1E293B]">{property.parkingSpaces}</p>
            </div>
          </div>
        )}

        {(property.numBedrooms !== undefined || property.numBathrooms !== undefined || property.parkingSpaces) && (
          <div className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
            <ChefHat size={24} className="text-[#5BA0A4]" />
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wide font-semibold mb-0.5">Kitchen</p>
            </div>
          </div>
        )}
      </div>

      {/* Rental Price */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-3 bg-[#5BA0A4] px-6 py-3 rounded-xl shadow-md">
          <span className="text-white font-bold text-2xl">
            {formatPrice(property.rentalPrice)}
          </span>
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div className="mt-6">
          <p className="text-[#1E293B] leading-relaxed">{property.description}</p>
        </div>
      )}
    </div>
  );
}