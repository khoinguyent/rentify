'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/Sidebar';
import { Bed, Bath, Square, Building2, ArrowLeft, Image as ImageIcon, Wrench, Save } from 'lucide-react';
import { AMENITIES_FALLBACK } from '@/components/property/amenities-fallback';
import ImageUploadDropzone from '@/components/ImageUploadDropzone';

interface UnitDetail {
  id: string;
  name: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  status: string;
  images: Array<{ url: string }>; // normalized by API proxy
  amenities?: Array<{ id: string; name: string; icon?: string }>; // optional if available
  description?: string | null;
  property?: { id: string; name: string } | null;
}

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [pendingAmenityIds, setPendingAmenityIds] = useState<string[] | null>(null);

  // Local editable state
  const [editState, setEditState] = useState<{
    name: string;
    floor: number | null;
    bedrooms: number;
    bathrooms: number;
    area: number;
    price: number;
  }>({ name: '', floor: null, bedrooms: 0, bathrooms: 0, area: 0, price: 0 });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/units/${params.id}`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUnit(data);
          setEditState({
            name: data.name,
            floor: data.floor,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            area: data.area,
            price: data.price,
          });
        } else {
          setUnit(null);
        }
      } catch (error) {
        console.error('Error fetching unit:', error);
        setUnit(null);
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) fetchUnit();
  }, [params?.id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handleSave = async () => {
    try {
      const payload = {
        name: editState.name,
        floor: editState.floor,
        bedrooms: editState.bedrooms,
        bathrooms: editState.bathrooms,
        area: editState.area,
        rent: editState.price,
        ...(pendingAmenityIds ? { amenities: pendingAmenityIds } : {}),
      };
      const response = await fetch(`/api/units/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updated = await response.json();
        setUnit({ ...unit!, ...updated });
        setPendingAmenityIds(null);
        setIsEditing(false);
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving changes');
    }
  };

  const refreshUnit = async () => {
    // Small delay to ensure DB is updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const refreshed = await fetch(`/api/units/${params.id}`, { credentials: 'include' });
    if (refreshed.ok) {
      const data = await refreshed.json();
      console.log('Refreshed unit data:', data);
      setUnit(data);
    }
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0 || !unit) return;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('folder', `units/${unit.id}`);
      fd.append('file', file);
      fd.append('objectType', 'Unit');
      fd.append('objectId', unit.id);
      fd.append('name', file.name);
      await fetch('/api/storage/upload', { method: 'POST', body: fd, credentials: 'include' });
    }
    await refreshUnit();
    setShowImagesModal(false);
  };

  const handleAddAmenitiesLocal = (selectedIds: string[]) => {
    setPendingAmenityIds(selectedIds);
    const mapped = AMENITIES_FALLBACK.filter(a => selectedIds.includes(a.id)).map(a => ({ id: a.id, name: a.name, icon: a.icon }));
    setUnit(prev => prev ? { ...prev, amenities: mapped } as any : prev);
    setShowAmenitiesModal(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5BA0A4] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading unit...</p>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex">
        <Sidebar />
        <main className="flex-1 p-8 ml-64">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-[#5BA0A4] mb-6">
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">Unit not found</p>
          </div>
        </main>
      </div>
    );
  }

  const displayArea = unit.area && unit.area > 0 ? `${unit.area} m²` : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-[#5BA0A4] mb-6">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{unit.name}</h1>
              {unit.property && (
                <p className="text-gray-600 flex items-center gap-2">
                  <Building2 size={16} /> {unit.property.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-[#E9F5F6] text-[#5BA0A4]">
                {unit.status}
              </span>
              {isEditing ? (
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-6 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] transition-colors font-medium flex items-center gap-2">
                    <Save size={18} /> Save
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-white border border-[#5BA0A4] text-[#5BA0A4] rounded-lg hover:bg-[#E9F5F6] transition-colors font-medium">
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Images header grid - same pattern as property/unit list */}
          <div className="mb-6">
            {unit.images?.length ? (
              unit.images.length === 1 ? (
                <div className="h-60 rounded-xl overflow-hidden bg-gray-100">
                  <img src={unit.images[0].url} alt={`${unit.name}-0`} className="w-full h-full object-cover" />
                </div>
              ) : unit.images.length === 2 ? (
                <div className="grid grid-cols-2 gap-3 h-60">
                  <div className="rounded-xl overflow-hidden bg-gray-100">
                    <img src={unit.images[0].url} alt={`${unit.name}-0`} className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-xl overflow-hidden bg-gray-100">
                    <img src={unit.images[1].url} alt={`${unit.name}-1`} className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 h-60 rounded-xl overflow-hidden bg-gray-100">
                    <img src={unit.images[0].url} alt={`${unit.name}-0`} className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-rows-2 gap-3 h-60">
                    <div className="rounded-xl overflow-hidden bg-gray-100">
                      <img src={unit.images[1].url} alt={`${unit.name}-1`} className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-xl overflow-hidden bg-gray-100">
                      <img src={unit.images[2]?.url || unit.images[1].url} alt={`${unit.name}-2`} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="h-60 rounded-xl bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex flex-col items-center justify-center">
                <ImageIcon className="text-[#5BA0A4]" size={48} />
                <p className="text-sm text-gray-500 mt-2">No images</p>
              </div>
            )}
            {isEditing && (
              <div className="mt-3 flex justify-end">
                <button onClick={() => setShowImagesModal(true)} className="px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] text-sm">Upload Images</button>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Bed className="text-[#5BA0A4] mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                {isEditing ? (
                  <input type="number" min={0} value={editState.bedrooms} onChange={(e) => setEditState({ ...editState, bedrooms: Number(e.target.value) })} className="mt-1 w-24 border rounded px-2 py-1" />
                ) : (
                  <p className="font-medium">{unit.bedrooms}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bath className="text-[#5BA0A4] mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                {isEditing ? (
                  <input type="number" min={0} value={editState.bathrooms} onChange={(e) => setEditState({ ...editState, bathrooms: Number(e.target.value) })} className="mt-1 w-24 border rounded px-2 py-1" />
                ) : (
                  <p className="font-medium">{unit.bathrooms}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Square className="text-[#5BA0A4] mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Area</p>
                {isEditing ? (
                  <input type="number" min={1} value={editState.area} onChange={(e) => setEditState({ ...editState, area: Number(e.target.value) })} className="mt-1 w-24 border rounded px-2 py-1" />
                ) : (
                  <p className="font-medium">{displayArea}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="text-[#5BA0A4] mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Floor</p>
                {isEditing ? (
                  <input type="number" value={editState.floor ?? 0} onChange={(e) => setEditState({ ...editState, floor: Number(e.target.value) })} className="mt-1 w-24 border rounded px-2 py-1" />
                ) : (
                  <p className="font-medium">{unit.floor !== null && unit.floor !== undefined ? `Floor ${unit.floor}` : 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mt-6 p-4 bg-[#E9F5F6] rounded-xl">
            <div>
              <p className="text-sm text-gray-600">Monthly Rent</p>
              {isEditing ? (
                <input type="number" min={0} value={editState.price} onChange={(e) => setEditState({ ...editState, price: Number(e.target.value) })} className="mt-1 w-40 border rounded px-2 py-1" />
              ) : (
                <p className="text-2xl font-bold text-[#5BA0A4]">{formatCurrency(unit.price)}</p>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Amenities</h3>
              {isEditing && (
                <button onClick={() => setShowAmenitiesModal(true)} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Manage</button>
              )}
            </div>
            {unit.amenities && unit.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {unit.amenities.map((a: any, idx: number) => {
                  const amenityName = typeof a === 'string' ? a : a.name || a;
                  const fallbackAmenity = AMENITIES_FALLBACK.find(x => x.name === amenityName || x.id === amenityName);
                  const icon = (typeof a === 'object' && a.icon) ? a.icon : (fallbackAmenity?.icon || '🏷️');
                  
                  return (
                    <span
                      key={a.id || amenityName || idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium bg-white text-gray-800 border-gray-300"
                      title={amenityName}
                    >
                      <span>{icon}</span>
                      {amenityName}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No amenities added yet</p>
                <p className="text-gray-400 text-xs mt-1">Click "Manage" to add amenities</p>
              </div>
            )}
          </div>

          {/* Images Modal */}
          {showImagesModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowImagesModal(false)}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{unit.name}</h2>
                    <button onClick={() => setShowImagesModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                  </div>
                  <ImageUploadDropzone unitId={unit.id} unitName={unit.name} onUploadComplete={async () => { await refreshUnit(); setShowImagesModal(false); }} />
                </div>
              </div>
            </div>
          )}

          {/* Amenities Modal */}
          {showAmenitiesModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Amenities</h4>
                {(() => {
                  // Build the preselected list from pending changes or current unit amenities
                  const current = pendingAmenityIds ?? (unit.amenities || []).map((a: any) => {
                    if (typeof a === 'string') {
                      // Could be an id or a name
                      const byId = AMENITIES_FALLBACK.find(x => x.id === a)?.id;
                      const byName = AMENITIES_FALLBACK.find(x => x.name === a)?.id;
                      return byId || byName || a;
                    }
                    if (a?.id) return a.id;
                    if (a?.name) {
                      const found = AMENITIES_FALLBACK.find(x => x.name === a.name);
                      return found?.id || a.name;
                    }
                    return undefined as unknown as string;
                  }).filter(Boolean);

                  return (
                    <AmenitiesSelector initialSelected={current as string[]} onCancel={() => setShowAmenitiesModal(false)} onSave={handleAddAmenitiesLocal} />
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


function AmenitiesSelector({ initialSelected, onSave, onCancel }: { initialSelected: string[]; onSave: (ids: string[]) => void; onCancel: () => void }) {
  const [selected, setSelected] = useState<string[]>(initialSelected || []);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {AMENITIES_FALLBACK.map(a => (
          <button
            key={a.id}
            type="button"
            onClick={() => toggle(a.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${selected.includes(a.id) ? 'bg-[#E9F5F6] text-[#5BA0A4] border-[#5BA0A4]' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
            title={a.name}
          >
            <span>{a.icon || '🏷️'}</span>
            {a.name}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
        <button onClick={() => onSave(selected)} className="px-4 py-2 bg-[#5BA0A4] text-white rounded-lg text-sm hover:bg-[#4a8e91]">Add</button>
      </div>
    </div>
  );
}

