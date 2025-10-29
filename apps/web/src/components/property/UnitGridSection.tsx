'use client';

import React, { useEffect, useState } from 'react';
import { Building, Bed, Bath, Square } from 'lucide-react';
import Link from 'next/link';
import { AMENITIES_FALLBACK } from './amenities-fallback';

interface Unit {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';
  thumbnailUrl?: string;
  amenities?: Array<{ id: string; name: string; icon?: string }>;
  images?: Array<{ url: string }>; // optional images from API
}

interface UnitGridSectionProps {
  propertyId: string;
}

export function UnitGridSection({ propertyId }: UnitGridSectionProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API
        const response = await fetch(`/api/properties/${propertyId}/units`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUnits(Array.isArray(data) ? data : []);
        } else {
          console.log('Using mock data for units');
          // Mock data as fallback
          setUnits([
            {
              id: 'u1',
              name: 'Unit 201',
              bedrooms: 2,
              bathrooms: 1,
              area: 68,
              price: 1200,
              status: 'AVAILABLE',
              thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'u2',
              name: 'Unit 305',
              bedrooms: 1,
              bathrooms: 1,
              area: 52,
              price: 980,
              status: 'RESERVED',
              thumbnailUrl: 'https://images.unsplash.com/photo-1560184897-ef1cbdcfbcbf?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'u3',
              name: 'Unit 402',
              bedrooms: 3,
              bathrooms: 2,
              area: 95,
              price: 1650,
              status: 'OCCUPIED',
              thumbnailUrl: 'https://images.unsplash.com/photo-1572120360610-d971b9b78825?auto=format&fit=crop&w=800&q=80'
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching units:', err);
        setError('Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchUnits();
    }
  }, [propertyId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-700';
      case 'OCCUPIED':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'RESERVED':
        return 'Reserved';
      case 'OCCUPIED':
        return 'Occupied';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Units</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 mb-2"></div>
                <div className="h-4 bg-gray-200 w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Units</h2>
        <div className="text-center py-8 text-gray-500">
          {error}
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Units</h2>

      <div className="space-y-5">
        {units.map((unit) => {
          // Normalize images: prefer images[], fallback to thumbnailUrl
          const images = (unit as any).images && (unit as any).images.length > 0
            ? (unit as any).images as Array<{ url: string }>
            : (unit.thumbnailUrl ? [{ url: unit.thumbnailUrl }] : []);
          const isAvailable = unit.status === 'AVAILABLE';

          return (
          <div key={unit.id} className={`${isAvailable ? 'bg-white' : 'bg-gray-50'} rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden`}>
            <div className="flex gap-4 p-4">
              {/* Left: images stack */}
              <div className="w-56 flex-shrink-0">
                {images.length > 0 ? (
                  <div className={images.length === 1 ? 'space-y-2' : 'space-y-2'}>
                    {/* Main image */}
                    <div className="h-36 w-full rounded-lg overflow-hidden">
                      <img src={images[0].url} alt={unit.name} className="h-full w-full object-cover" />
                    </div>
                    
                    {/* Thumbnails - only show if we have 2+ images */}
                    {images.length >= 2 && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-16 rounded-lg overflow-hidden">
                          <img src={images[1].url} alt={`${unit.name} - Image 2`} className="h-full w-full object-cover" />
                        </div>
                        {images.length >= 3 ? (
                          <div className="h-16 rounded-lg overflow-hidden">
                            <img src={images[2].url} alt={`${unit.name} - Image 3`} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-16 bg-gray-100 rounded-lg"></div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-36 w-full flex items-center justify-center bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] rounded-lg">
                    <div className="text-center">
                      <Building className="text-[#5BA0A4]" size={40} />
                      <p className="text-xs text-gray-500 mt-2">No images</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: content */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{unit.name}</h3>
                  <div className="flex items-center gap-3">
                    {typeof (unit as any).floor === 'number' ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-[#E9F5F6] text-[#5BA0A4]">floor {Math.round((unit as any).floor)}</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-[#E9F5F6] text-[#5BA0A4]">floor N/A</span>
                    )}
                    <span className="text-xl font-bold text-[#5BA0A4]">${unit.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-auto">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Square size={14} />{unit.area} m²</span>
                    <span className="flex items-center gap-1"><Bed size={14} />{unit.bedrooms} br</span>
                    <span className="flex items-center gap-1"><Bath size={14} />{unit.bathrooms} wc</span>
                  </div>
                  <p className="mt-2 text-gray-700">A very comfortable flat</p>
                </div>

                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const amenities: any[] = Array.isArray((unit as any).amenities) ? (unit as any).amenities : [];
                      const normalized = amenities.map((a: any, idx: number) => {
                        if (typeof a === 'string') {
                          const f = AMENITIES_FALLBACK.find(x => x.id === a || x.name === a);
                          return { id: f?.id || a || String(idx), name: f?.name || a, icon: f?.icon };
                        }
                        const byId = a?.id ? AMENITIES_FALLBACK.find(x => x.id === a.id) : undefined;
                        const byName = a?.name ? AMENITIES_FALLBACK.find(x => x.name === a.name) : undefined;
                        return {
                          id: a?.id || byName?.id || byId?.id || String(idx),
                          name: a?.name || byId?.name || byName?.name || 'Amenity',
                          icon: a?.icon || byId?.icon || byName?.icon,
                        };
                      }).filter(x => !!x.name);

                      if (normalized.length === 0) {
                        return (
                          <span className="px-3 py-1.5 rounded-full border text-sm text-gray-500 bg-white border-gray-300">No amenities</span>
                        );
                      }

                      return normalized.map(a => (
                        <span
                          key={a.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium bg-white text-gray-800 border-gray-300"
                          title={a.name}
                        >
                          <span>{a.icon || '🏷️'}</span>
                          {a.name}
                        </span>
                      ));
                    })()}
                  </div>
                  <Link href={`/units/${unit.id}`} className="ml-4 px-4 py-2 bg-[#5BA0A4] text-white rounded-lg text-sm hover:bg-[#4a8e91] whitespace-nowrap">View details</Link>
                </div>
              </div>
            </div>
          </div>
        );})}
      </div>
    </section>
  );
}

