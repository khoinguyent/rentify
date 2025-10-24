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
  status: string;
}

interface PropertyHeaderProps {
  property: Property;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const fullAddress = `${property.address}${property.city ? `, ${property.city}` : ''}${property.state ? `, ${property.state}` : ''}`;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-white p-6 rounded-2xl shadow">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">{property.name}</h1>
        <p className="text-gray-500 mb-3">{fullAddress}</p>
        <PropertyStatusBadge status={property.status} />
      </div>
      <div className="flex gap-2">
        <Link
          href={`/properties/${property.id}/edit`}
          className="bg-[#5BA0A4] text-white px-4 py-2 rounded-md hover:bg-[#4a8e91] transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Property
        </Link>
        <button className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-gray-700 flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}

