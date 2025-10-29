'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PropertyEditForm } from '@/components/property/PropertyEditForm';
import { getPropertyById, Property } from '@/lib/api';
import Link from 'next/link';

export default function EditPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  // Unit inline edit/add removed from property edit view per requirements

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        console.log('EditPage - Fetching property:', propertyId);
        const data = await getPropertyById(propertyId);
        console.log('EditPage - Property data received:', {
          id: data?.id,
          name: data?.name,
          amenitiesCount: data?.amenities?.length || 0,
          amenities: data?.amenities
        });
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && propertyId) {
      fetchProperty();
    }
  }, [status, propertyId]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/properties')}
              className="bg-[#5BA0A4] text-white px-4 py-2 rounded-md hover:bg-[#4a8e91] transition-colors"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-30">
          <button
            onClick={() => router.push(`/properties/${propertyId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Property
          </button>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Edit Property</h1>
              <p className="text-gray-600 mt-1">Update property information</p>
            </div>
            <PropertyEditForm property={property} />

            {/* Units management removed from this view */}
          </div>
        </main>
      </div>
    </div>
  );
}

