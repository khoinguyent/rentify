'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

type PropertyLike = {
  address?: string;
  latitude?: number;
  longitude?: number;
};

type LocationPayload = {
  address: string;
  latitude: number;
  longitude: number;
};

interface PropertyLocationEditorProps {
  property?: PropertyLike;
  onChange: (data: LocationPayload) => void;
  editable?: boolean;
  height?: number | string;
}

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // New York fallback
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' } as const;

export function PropertyLocationEditor({
  property,
  onChange,
  editable = false,
  height = 320,
}: PropertyLocationEditorProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey || '' , libraries: ['places'] });

  const initialCenter = useMemo(() => {
    if (property?.latitude && property?.longitude) {
      return { lat: property.latitude, lng: property.longitude };
    }
    return DEFAULT_CENTER;
  }, [property?.latitude, property?.longitude]);

  const [center, setCenter] = useState(initialCenter);
  const [address, setAddress] = useState<string>(property?.address || '');

  useEffect(() => {
    setCenter(initialCenter);
    setAddress(property?.address || '');
  }, [initialCenter, property?.address]);

  const markerPosition = useMemo(() => ({
    lat: property?.latitude ?? center.lat,
    lng: property?.longitude ?? center.lng,
  }), [property?.latitude, property?.longitude, center.lat, center.lng]);

  const handleMarkerDragEnd = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!editable) return;
    const latLng = e.latLng;
    if (!latLng) return;
    const lat = latLng.lat();
    const lng = latLng.lng();

    try {
      const results = await getGeocode({ location: { lat, lng } });
      const formatted = results[0]?.formatted_address || address;
      setCenter({ lat, lng });
      setAddress(formatted);
      onChange({ address: formatted, latitude: lat, longitude: lng });
    } catch {
      setCenter({ lat, lng });
      onChange({ address: address || '', latitude: lat, longitude: lng });
    }
  }, [address, editable, onChange]);

  // Places Autocomplete
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    defaultValue: property?.address || '',
  });

  useEffect(() => {
    setValue(property?.address || '', false);
  }, [property?.address, setValue]);

  const handleSelectSuggestion = useCallback(async (description: string) => {
    setValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      setCenter({ lat, lng });
      setAddress(description);
      onChange({ address: description, latitude: lat, longitude: lng });
    } catch {
      // ignore
    }
  }, [clearSuggestions, onChange, setValue]);

  return (
    <div className="w-full" style={{ backgroundColor: '#F8FBFB' }}>
      {editable && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Address</label>
          <div className="relative">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search for an address"
              disabled={!ready}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5BA0A4] focus:border-[#5BA0A4]"
            />
            {status === 'OK' && data.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                {data.map(({ place_id, description }) => (
                  <li
                    key={place_id}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => handleSelectSuggestion(description)}
                  >
                    {description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl shadow-sm overflow-hidden" style={{ height }}>
        {!isLoaded ? (
          <div className="h-full w-full flex items-center justify-center bg-white">Loading map…</div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={markerPosition}
            zoom={14}
            options={{
              disableDefaultUI: editable ? false : true,
              draggable: editable ? true : false,
              gestureHandling: editable ? 'auto' : 'none',
              clickableIcons: false,
            }}
          >
            <Marker
              position={markerPosition}
              draggable={!!editable}
              onDragEnd={handleMarkerDragEnd}
            />
          </GoogleMap>
        )}
      </div>

      <div className="mt-3">
        <div className="text-sm font-medium text-gray-900">Address</div>
        <div className="text-sm text-gray-700 break-words">{address || 'Not set'}</div>
        {markerPosition && (
          <a
            href={`https://www.google.com/maps?q=${markerPosition.lat},${markerPosition.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5BA0A4] text-sm hover:underline"
          >
            Open in Google Maps
          </a>
        )}
      </div>
    </div>
  );
}

export default PropertyLocationEditor;


