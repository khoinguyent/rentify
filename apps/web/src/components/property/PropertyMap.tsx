import React from 'react';

interface Property {
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface PropertyMapProps {
  property: Property;
}

export function PropertyMap({ property }: PropertyMapProps) {
  if (!property.latitude || !property.longitude) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Location</h2>
        <p className="text-gray-500">Location information not available</p>
      </div>
    );
  }

  const mapSrc = `https://www.google.com/maps?q=${property.latitude},${property.longitude}&hl=en&z=14&output=embed`;

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Location</h2>
      <iframe
        src={mapSrc}
        className="w-full h-64 rounded-lg border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

