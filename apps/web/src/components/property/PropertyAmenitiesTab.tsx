'use client';

import { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Amenity {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface PropertyAmenitiesTabProps {
  propertyId: string;
  selectedAmenities: string[];
  onAmenitiesChange: (amenityIds: string[]) => void;
}

export default function PropertyAmenitiesTab({
  propertyId,
  selectedAmenities,
  onAmenitiesChange,
}: PropertyAmenitiesTabProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties/amenities', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch amenities');
      }
      const data = await response.json();
      setAmenities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch amenities');
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    const isSelected = selectedAmenities.includes(amenityId);
    if (isSelected) {
      onAmenitiesChange(selectedAmenities.filter(id => id !== amenityId));
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId]);
    }
  };

  // Group amenities by category
  const groupedAmenities = {
    'Basic Amenities': amenities.filter(a => 
      ['WiFi', 'Air Conditioning', 'Heating', 'Kitchen', 'Refrigerator', 'Microwave', 'Dishwasher', 'Coffee Maker'].includes(a.name)
    ),
    'Bathroom & Laundry': amenities.filter(a => 
      ['Washing Machine', 'Dryer', 'Hot Water'].includes(a.name)
    ),
    'Entertainment': amenities.filter(a => 
      ['TV', 'Sound System', 'Game Console'].includes(a.name)
    ),
    'Outdoor & Parking': amenities.filter(a => 
      ['Parking', 'Balcony', 'Garden', 'Patio', 'BBQ Grill'].includes(a.name)
    ),
    'Building Amenities': amenities.filter(a => 
      ['Swimming Pool', 'Gym', 'Sauna', 'Elevator', 'Concierge'].includes(a.name)
    ),
    'Safety & Security': amenities.filter(a => 
      ['Security System', 'Smoke Detector', 'Carbon Monoxide Detector'].includes(a.name)
    ),
    'Pet & Family': amenities.filter(a => 
      ['Pet Friendly', 'Child Friendly', 'High Chair'].includes(a.name)
    ),
    'Accessibility': amenities.filter(a => 
      ['Wheelchair Accessible', 'Step-Free Access'].includes(a.name)
    ),
    'Work & Business': amenities.filter(a => 
      ['Dedicated Workspace', 'Printer'].includes(a.name)
    ),
    'Luxury Amenities': amenities.filter(a => 
      ['Jacuzzi', 'Fireplace', 'Wine Cellar'].includes(a.name)
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading amenities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading amenities: {error}</p>
        <button
          onClick={fetchAmenities}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Property Amenities</h3>
        <span className="text-sm text-gray-500">
          {selectedAmenities.length} selected
        </span>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
          <div key={category}>
            <h4 className="text-md font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
              {category}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);
                return (
                  <div
                    key={amenity.id}
                    className={`
                      relative border rounded-lg p-4 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                    onClick={() => handleAmenityToggle(amenity.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {amenity.icon ? (
                          <span className="text-2xl">{amenity.icon}</span>
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm">🏠</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {amenity.name}
                        </h5>
                        {amenity.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {amenity.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {isSelected && (
                          <CheckIcon className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedAmenities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No amenities selected yet.</p>
          <p className="text-sm">Click on amenities above to add them to your property.</p>
        </div>
      )}
    </div>
  );
}
