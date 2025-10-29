import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import PropertyLocationEditor from './PropertyLocationEditor';

interface Property {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressMapSectionProps {
  property: Property;
}

export function AddressMapSection({ property }: AddressMapSectionProps) {
  const formatAddress = () => {
    const parts = [property.address];
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    if (property.country) parts.push(property.country);
    return parts.join(', ');
  };

  const getGoogleMapsLink = () => {
    const address = encodeURIComponent(formatAddress());
    return `https://www.google.com/maps/search/?api=1&query=${address}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin size={24} className="text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-700 leading-relaxed">{formatAddress()}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href={getGoogleMapsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Navigation size={16} />
              <span>Get Directions</span>
            </a>
            
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <MapPin size={16} />
              <span>Copy Address</span>
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Map</h3>
          
          {property.latitude && property.longitude ? (
            <div className="relative h-64 rounded-lg overflow-hidden">
              <PropertyLocationEditor
                property={{
                  address: formatAddress(),
                  latitude: property.latitude,
                  longitude: property.longitude,
                }}
                editable={false}
                onChange={() => {}}
                height={256}
              />
            </div>
          ) : (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Map not available</p>
                <p className="text-sm text-gray-400">Coordinates not provided</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
