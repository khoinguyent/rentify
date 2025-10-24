import React from 'react';

interface Property {
  photos?: string[];
  imageUrl?: string;
}

interface PropertyMediaProps {
  property: Property;
}

export function PropertyMedia({ property }: PropertyMediaProps) {
  const images = property.photos && property.photos.length > 0 ? property.photos : property.imageUrl ? [property.imageUrl] : [];

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Photos</h2>
        <p className="text-gray-500">No photos available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Photos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((src, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-lg">
            <img
              src={src}
              alt={`Property photo ${idx + 1}`}
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/house.svg';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

