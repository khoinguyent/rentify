'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Home, MapPin, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface Lease {
  id: string;
  propertyName: string;
  address: string;
  monthlyRent: number;
  nextBillDate: string;
  status: 'Active' | 'Pending Termination' | 'Renewal';
  imageUrl?: string;
}

interface ActiveLeasesSectionProps {
  leases: Lease[];
}

export function ActiveLeasesSection({ leases }: ActiveLeasesSectionProps) {
  if (leases.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm bg-white mb-10">
        <CardContent className="p-8 text-center">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No active leases found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Active Leases</h2>
        <span className="text-sm text-gray-500">{leases.length} property(ies)</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {leases.map((lease) => (
          <Card key={lease.id} className="rounded-2xl shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 bg-gradient-to-br from-[#5BA0A4] to-[#4A8D90]">
              {lease.imageUrl ? (
                <Image
                  src={lease.imageUrl}
                  alt={lease.propertyName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Home className="h-16 w-16 text-white opacity-50" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    lease.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : lease.status === 'Pending Termination'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {lease.status === 'Active' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {lease.status}
                </span>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {lease.propertyName}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-1.5" />
                {lease.address}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#E9F5F6] rounded-lg">
                    <DollarSign className="h-4 w-4 text-[#5BA0A4]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly Rent</p>
                    <p className="font-semibold text-gray-900">
                      ${lease.monthlyRent.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#E9F5F6] rounded-lg">
                    <Calendar className="h-4 w-4 text-[#5BA0A4]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Next Bill</p>
                    <p className="font-semibold text-gray-900">{lease.nextBillDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

