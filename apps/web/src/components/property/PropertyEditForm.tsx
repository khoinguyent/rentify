'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  StarIcon, 
  PhotoIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import PropertyAmenitiesTab from './PropertyAmenitiesTab';
import PropertyImagesTab from './PropertyImagesTab';
import UnitsTab from './UnitsTab';

interface Property {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  rentalPrice?: number;
  status: string;
  type?: string;
  furnishing?: string;
  numBedrooms?: number;
  numBathrooms?: number;
  floorArea?: number;
  parkingSpaces?: number;
  availableFrom?: string;
  description?: string;
  amenities?: Array<{ amenity: { id: string; name: string } }>;
  images?: Array<{
    id: string;
    fileName: string;
    originalName: string;
    url: string;
    altText?: string;
    caption?: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  // Multi-unit config
  isMultiUnit?: boolean;
  allowWholeRent?: boolean;
  wholeRentPrice?: number | null;
}

interface PropertyEditFormProps {
  property: Property;
}

type TabType = 'basic' | 'amenities' | 'images' | 'units';

export function PropertyEditForm({ property }: PropertyEditFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState({
    name: property.name,
    address: property.address,
    city: property.city || '',
    state: property.state || '',
    country: property.country || 'US',
    latitude: property.latitude?.toString() || '',
    longitude: property.longitude?.toString() || '',
    rentalPrice: property.rentalPrice?.toString() || '',
    status: property.status,
    type: property.type || 'APARTMENT',
    furnishing: property.furnishing || 'UNFURNISHED',
    numBedrooms: property.numBedrooms?.toString() || '',
    numBathrooms: property.numBathrooms?.toString() || '',
    floorArea: property.floorArea?.toString() || '',
    parkingSpaces: property.parkingSpaces?.toString() || '',
    availableFrom: property.availableFrom || '',
    description: property.description || '',
    isMultiUnit: property.isMultiUnit ?? false,
    allowWholeRent: property.allowWholeRent ?? false,
    wholeRentPrice: property.wholeRentPrice?.toString() || '',
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    console.log('PropertyEditForm - property.amenities:', property.amenities);
    // Handle both nested and flat structures for backward compatibility
    const amenityIds = property.amenities?.map(a => a.amenity?.id || a.id) || [];
    console.log('PropertyEditForm - selectedAmenities initialized with:', amenityIds);
    return amenityIds;
  });
  const selectedAmenityNames = (property.amenities || []).map((a: any) => a.amenity?.name || a.name).filter(Boolean);
  const [images, setImages] = useState(property.images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const imagesTabRef = useRef<any>(null);
  const [unitsInitial, setUnitsInitial] = useState<any[]>([]);

  // Fetch existing units for this property to prefill Units tab
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch(`/api/properties/${property.id}/units`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        // Map API units to UnitsTab shape
        const mapped = (Array.isArray(data) ? data : []).map((u: any) => ({
          id: u.id,
          name: u.name || '',
          floor: u.floor ?? '',
          area: u.area ?? '',
          bedrooms: u.bedrooms ?? '',
          bathrooms: u.bathrooms ?? '',
          kitchen: !!u.kitchen,
          balcony: !!u.balcony,
          amenities: Array.isArray(u.amenities) ? u.amenities.map((a: any) => a.id || a) : [],
          images: [], // existing images not editable here; uploads are local until saved
        }));
        setUnitsInitial(mapped);
      } catch {}
    };
    fetchUnits();
  }, [property.id]);

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: HomeIcon },
    { id: 'amenities', name: 'Amenities', icon: StarIcon },
    { id: 'images', name: 'Images', icon: PhotoIcon },
    { id: 'units', name: 'Units', icon: HomeIcon },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload any pending images first
      if (imagesTabRef.current) {
        const newImages = await imagesTabRef.current.uploadTempImages();
        if (newImages.length > 0) {
          setImages(prev => [...prev, ...newImages]);
        }
      }

      // Prepare data for API
      const submitData = {
        ...formData,
        // Convert empty strings to undefined for optional fields
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        rentalPrice: formData.rentalPrice ? parseFloat(formData.rentalPrice) : undefined,
        furnishing: formData.furnishing || undefined,
        numBedrooms: formData.numBedrooms ? parseInt(formData.numBedrooms) : undefined,
        numBathrooms: formData.numBathrooms ? parseInt(formData.numBathrooms) : undefined,
        floorArea: formData.floorArea ? parseFloat(formData.floorArea) : undefined,
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : undefined,
        availableFrom: formData.availableFrom.trim() || undefined,
        description: formData.description.trim() || undefined,
        amenities: selectedAmenities,
        // Coerce optional numeric/boolean fields
        isMultiUnit: !!formData.isMultiUnit,
        allowWholeRent: !!formData.allowWholeRent,
        wholeRentPrice: formData.wholeRentPrice ? parseFloat(formData.wholeRentPrice) : undefined,
      };

      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update property');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/properties/${property.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/properties/${property.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Property updated successfully! Redirecting...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RENTED">Rented</option>
                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    <option value="COMING_SOON">Coming Soon</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Property Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="CONDO">Condo</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="STUDIO">Studio</option>
                    <option value="LOFT">Loft</option>
                    <option value="PENTHOUSE">Penthouse</option>
                    <option value="VILLA">Villa</option>
                    <option value="DUPLEX">Duplex</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="furnishing" className="block text-sm font-medium text-gray-700">
                    Furnishing
                  </label>
                  <select
                    id="furnishing"
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="FURNISHED">Furnished</option>
                    <option value="SEMI_FURNISHED">Semi-Furnished</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="rentalPrice" className="block text-sm font-medium text-gray-700">
                    Rental Price ($)
                  </label>
                  <input
                    type="number"
                    id="rentalPrice"
                    name="rentalPrice"
                    value={formData.rentalPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="numBedrooms" className="block text-sm font-medium text-gray-700">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="numBedrooms"
                    name="numBedrooms"
                    value={formData.numBedrooms}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="numBathrooms" className="block text-sm font-medium text-gray-700">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="numBathrooms"
                    name="numBathrooms"
                    value={formData.numBathrooms}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="floorArea" className="block text-sm font-medium text-gray-700">
                    Floor Area (sq ft)
                  </label>
                  <input
                    type="number"
                    id="floorArea"
                    name="floorArea"
                    value={formData.floorArea}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="parkingSpaces" className="block text-sm font-medium text-gray-700">
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    id="parkingSpaces"
                    name="parkingSpaces"
                    value={formData.parkingSpaces}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700">
                    Available From
                  </label>
                  <input
                    type="date"
                    id="availableFrom"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {/* Multi-Unit Configuration */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Rental Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isMultiUnit"
                        checked={formData.isMultiUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, isMultiUnit: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">This is a multi-unit property</span>
                    </label>
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="allowWholeRent"
                        checked={formData.allowWholeRent}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowWholeRent: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Allow renting entire property</span>
                    </label>
                    {formData.allowWholeRent && (
                      <div>
                        <label htmlFor="wholeRentPrice" className="block text-sm font-medium text-gray-700">
                          Whole Rent Price ($)
                        </label>
                        <input
                          type="number"
                          id="wholeRentPrice"
                          name="wholeRentPrice"
                          value={formData.wholeRentPrice}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Property Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe your property..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Amenities Tab */}
        {activeTab === 'amenities' && (
          <div className="bg-white shadow rounded-lg p-6">
            <PropertyAmenitiesTab
              propertyId={property.id}
              selectedAmenities={selectedAmenities}
            selectedAmenityNames={selectedAmenityNames}
              onAmenitiesChange={setSelectedAmenities}
            />
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="bg-white shadow rounded-lg p-6">
            <PropertyImagesTab
              ref={imagesTabRef}
              propertyId={property.id}
              images={images}
              onImagesChange={setImages}
            />
          </div>
        )}

        {/* Units Tab placeholder */}
        {activeTab === 'units' && (
          <div className="bg-white shadow rounded-lg p-6">
            <UnitsTab
              propertyId={property.id}
              initialUnits={unitsInitial}
              onUnitsChange={() => {}}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}