'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AMENITIES_FALLBACK } from './amenities-fallback';

export interface UnitEditable {
  id?: string;
  name: string;
  floor: number | '';
  area: number | '';
  bedrooms: number | '';
  bathrooms: number | '';
  rent?: number | '';
  amenities: string[]; // amenity ids
  images: File[]; // local images (max 5)
}

interface UnitsTabProps {
  propertyId: string;
  initialUnits?: UnitEditable[];
  onUnitsChange?: (units: UnitEditable[]) => void;
  allAmenities?: { id: string; name: string; icon?: string }[]; // optional if provided from parent
}

export default function UnitsTab({ propertyId, initialUnits = [], onUnitsChange, allAmenities }: UnitsTabProps) {
  const router = useRouter();
  const [units, setUnits] = useState<UnitEditable[]>(
    initialUnits.length > 0
      ? initialUnits
      : [
          {
            name: '',
            floor: '',
            area: '',
            bedrooms: '',
            bathrooms: '',
            rent: '',
            amenities: [],
            images: [],
          },
        ]
  );

  const [amenitiesModalUnitIdx, setAmenitiesModalUnitIdx] = useState<number | null>(null);

  const amenities = allAmenities && allAmenities.length > 0 ? allAmenities : AMENITIES_FALLBACK;

  const updateUnits = (updater: (prev: UnitEditable[]) => UnitEditable[]) => {
    setUnits((prev) => {
      const next = updater(prev);
      onUnitsChange?.(next);
      return next;
    });
  };

  const addUnit = () => {
    updateUnits((prev) => [
      ...prev,
      {
        name: '',
        floor: '',
        area: '',
        bedrooms: '',
        bathrooms: '',
        amenities: [],
        images: [],
      },
    ]);
  };

  const removeUnit = (idx: number) => {
    updateUnits((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (idx: number) => {
    const u = units[idx];
    const payload: any = {
      name: u.name,
      floor: u.floor === '' ? undefined : u.floor,
      sizeM2: u.area === '' ? undefined : u.area,
      bedrooms: u.bedrooms === '' ? undefined : u.bedrooms,
      bathrooms: u.bathrooms === '' ? undefined : u.bathrooms,
        rent: u.rent === '' ? undefined : u.rent,
      // send amenities (ids) if any
      amenities: Array.isArray(u.amenities) && u.amenities.length ? u.amenities : undefined,
    };

    try {
      const res = await fetch(u.id ? `/api/units/${u.id}` : `/api/units`, {
        method: u.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(u.id ? payload : { ...payload, propertyId }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        // If backend rejects non-whitelisted fields, retry without them
        const shouldStrip = /should not exist/.test(errorText) && /(amenities|kitchen|balcony)/i.test(errorText);
        if (shouldStrip) {
          const stripped: any = { ...payload };
          delete stripped.amenities;
          const retry = await fetch(u.id ? `/api/units/${u.id}` : `/api/units`, {
            method: u.id ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(u.id ? stripped : { ...stripped, propertyId }),
          });
          if (!retry.ok) {
            console.error('Failed to save unit (retry)', await retry.text());
            return;
          }
          const savedRetry = await retry.json();
          updateUnits((prev) => {
            const next = [...prev];
            next[idx] = { ...u, id: savedRetry.id };
            return next;
          });
          router.push(`/properties/${propertyId}`);
          return;
        }
        console.error('Failed to save unit', errorText);
        return;
      }
      const saved = await res.json();
      updateUnits((prev) => {
        const next = [...prev];
        next[idx] = { ...u, id: saved.id };
        return next;
      });
      // Redirect back to property page after successful save
      router.push(`/properties/${propertyId}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageAdd = (idx: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    updateUnits((prev) => {
      const next = [...prev];
      const existing = next[idx].images;
      const toAdd = Array.from(files).slice(0, Math.max(0, 5 - existing.length));
      next[idx] = { ...next[idx], images: [...existing, ...toAdd] };
      return next;
    });
  };

  const handleImageRemove = (idx: number, imageIdx: number) => {
    updateUnits((prev) => {
      const next = [...prev];
      const images = [...next[idx].images];
      images.splice(imageIdx, 1);
      next[idx] = { ...next[idx], images };
      return next;
    });
  };

  const toggleAmenity = (unitIdx: number, amenityId: string) => {
    updateUnits((prev) => {
      const next = [...prev];
      const cur = new Set(next[unitIdx].amenities);
      if (cur.has(amenityId)) cur.delete(amenityId);
      else cur.add(amenityId);
      next[unitIdx] = { ...next[unitIdx], amenities: Array.from(cur) };
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {units.map((u, idx) => (
        <div key={idx} className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3
                className="text-lg font-semibold text-gray-900 cursor-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateUnits((prev) => { const next=[...prev]; next[idx] = { ...next[idx], name: e.currentTarget.textContent || '' }; return next; })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).blur(); } }}
              >
                {u.name || 'Unit name'}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E9F5F6] text-[#5BA0A4]">Floor {u.floor || 0}</span>
            </div>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => handleSave(idx)}
                className="px-3 py-1.5 bg-[#5BA0A4] text-white rounded-md text-sm hover:bg-[#4a8e91]"
              >
                Save
              </button>
              {units.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUnit(idx)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700">Rent ($/month)</label>
              <input
                type="number"
                value={u.rent ?? ''}
                onChange={(e) => updateUnits((prev) => {
                  const next = [...prev];
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  next[idx] = { ...next[idx], rent: v };
                  return next;
                })}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                placeholder="0"
                min={0}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Floor</label>
              <input
                type="number"
                value={u.floor}
                onChange={(e) => updateUnits((prev) => {
                  const next = [...prev];
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  next[idx] = { ...next[idx], floor: v };
                  return next;
                })}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Area (m²)</label>
              <input
                type="number"
                value={u.area}
                onChange={(e) => updateUnits((prev) => {
                  const next = [...prev];
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  next[idx] = { ...next[idx], area: v };
                  return next;
                })}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Bedrooms</label>
              <input
                type="number"
                value={u.bedrooms}
                onChange={(e) => updateUnits((prev) => {
                  const next = [...prev];
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  next[idx] = { ...next[idx], bedrooms: v };
                  return next;
                })}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Bathrooms</label>
              <input
                type="number"
                value={u.bathrooms}
                onChange={(e) => updateUnits((prev) => {
                  const next = [...prev];
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  next[idx] = { ...next[idx], bathrooms: v };
                  return next;
                })}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                placeholder="0"
                min={0}
              />
            </div>
            <div className="flex items-center space-x-4 mt-6 md:mt-0"></div>
          </div>

          {/* Images */}
          <div className="mt-4">
            <label className="block text-sm text-gray-700 mb-2">Images (up to 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageAdd(idx, e.target.files)}
              className="block text-sm"
            />
            {u.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                {u.images.map((file, i) => (
                  <div key={i} className="relative border rounded overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(idx, i)}
                      className="absolute top-1 right-1 bg-white/80 rounded px-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700">Amenities</label>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[20px]">
              {amenities.map((a) => {
                const selected = u.amenities.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAmenity(idx, a.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${
                      selected
                        ? 'bg-[#E9F5F6] text-[#5BA0A4] border-[#5BA0A4]'
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                    }`}
                    title={a.name}
                  >
                    <span>{(a as any).icon || '🏷️'}</span>
                    {a.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <div className="pt-2">
        <button
          type="button"
          onClick={addUnit}
          className="px-4 py-2 bg-[#5BA0A4] text-white rounded-md hover:bg-[#4a8e91]"
        >
          Add Unit
        </button>
      </div>

      {/* Modal removed; chip list serves as editor */}
    </div>
  );
}


