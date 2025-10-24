import React from 'react';

interface Property {
  description?: string;
}

interface PropertyDescriptionProps {
  property: Property;
}

export function PropertyDescription({ property }: PropertyDescriptionProps) {
  if (!property.description) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
        <p className="text-gray-500">No description available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
    </div>
  );
}

