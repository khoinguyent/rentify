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
}

interface PropertyEditFormProps {
  property: Property;
}

type TabType = 'basic' | 'amenities' | 'images';

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
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    console.log('PropertyEditForm - property.amenities:', property.amenities);
    // Handle both nested and flat structures for backward compatibility
    const amenityIds = property.amenities?.map(a => a.amenity?.id || a.id) || [];
    console.log('PropertyEditForm - selectedAmenities initialized with:', amenityIds);
    return amenityIds;
  });
  const [images, setImages] = useState(property.images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const imagesTabRef = useRef<any>(null);

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: HomeIcon },
    { id: 'amenities', name: 'Amenities', icon: StarIcon },
    { id: 'images', name: 'Images', icon: PhotoIcon },
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