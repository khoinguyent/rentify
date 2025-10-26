'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PropertyImageGallery } from '@/components/property/PropertyImageGallery';
import { PropertyHeader } from '@/components/property/PropertyHeader';
import { AddressMapSection } from '@/components/property/AddressMapSection';
import { PropertyAmenities } from '@/components/property/PropertyAmenities';
import { TenantContactCard } from '@/components/property/TenantContactCard';
import { LeaseCard } from '@/components/property/LeaseCard';
import { MobileContactBar } from '@/components/property/MobileContactBar';
import { getPropertyById, Property } from '@/lib/api';

export default function PropertyDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyById(propertyId);
        if (data) {
          setProperty(data);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && propertyId) {
      fetchProperty();
    }
  }, [status, propertyId]);

  const handleContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BA0A4] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6">
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-red-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Property</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/properties')}
              className="bg-[#5BA0A4] text-white px-6 py-2.5 rounded-lg hover:bg-[#4a8e91] transition-colors font-medium shadow-md"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/properties')}
              className="bg-[#5BA0A4] text-white px-6 py-2.5 rounded-lg hover:bg-[#4a8e91] transition-colors font-medium shadow-md"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tenant = property.activeTenant;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => router.push('/properties')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Properties
          </button>
        </header>

        {/* Page Content */}
        <main className="p-6 pb-20 md:pb-6 space-y-8">
          <div className="max-w-7xl mx-auto">
            {/* Image Gallery Block */}
            <div className="mb-8 animate-in fade-in duration-500">
              <PropertyImageGallery 
                images={property.photos || []} 
                alt={property.name}
              />
            </div>

            {/* Main Content Grid */}
            <div className={`grid grid-cols-1 ${tenant ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
              {/* Left Column - Main Content */}
              <div className={`${tenant ? 'lg:col-span-2' : 'lg:col-span-1'} space-y-8`}>
                {/* Property Header Block */}
                <div className="bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] rounded-2xl shadow-md px-8 py-10 animate-in slide-in-from-top duration-700">
                  <PropertyHeader property={property} />
                </div>

                {/* Location Block */}
                <div className="bg-white rounded-2xl shadow-md px-8 py-8 animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '100ms' }}>
                  <AddressMapSection property={property} />
                </div>

                {/* Amenities Block */}
                <div className="animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
                  <PropertyAmenities amenities={property.amenities || []} />
                </div>
              </div>

              {/* Right Column - Contact Card & Lease Card */}
              {tenant ? (
                <div className="lg:col-span-1 space-y-8">
                  <div id="contact-section">
                    <TenantContactCard 
                      tenant={tenant} 
                      propertyName={property.name}
                    />
                  </div>
                  
                  <LeaseCard lease={property.activeLease} onAddLease={() => {
                    console.log('Add lease clicked');
                    // TODO: Implement lease creation modal or redirect
                  }} />
                </div>
              ) : (
                <div className="lg:col-span-2">
                  <LeaseCard lease={property.activeLease} onAddLease={() => {
                    console.log('Add lease clicked');
                    // TODO: Implement lease creation modal or redirect
                  }} />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Mobile Contact Bar */}
        {tenant && (
          <MobileContactBar
            property={property}
            onContact={handleContact}
            onFavorite={handleFavorite}
            isFavorite={isFavorite}
          />
        )}
      </div>
    </div>
  );
}