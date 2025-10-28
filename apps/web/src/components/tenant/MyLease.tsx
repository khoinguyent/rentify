'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTenantLease } from '@/lib/hooks/useTenantDashboard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MyLeaseProps {
  tenantId: string;
}

export function MyLease({ tenantId }: MyLeaseProps) {
  const { data: lease, error, isLoading } = useTenantLease(tenantId);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Lease</CardTitle>
          <CardDescription>Your current lease information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Failed to load lease information</p>
        </CardContent>
      </Card>
    );
  }

  if (!lease && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Lease</CardTitle>
          <CardDescription>Your current lease information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No active lease found</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Lease</CardTitle>
          <CardDescription>Your current lease information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Lease</CardTitle>
        <CardDescription>Your current lease information</CardDescription>
      </CardHeader>
      <CardContent>
        {lease ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Rent Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(lease.rentAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  lease.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  lease.status === 'EXPIRED' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {lease.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-base">{formatDate(lease.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="text-base">{formatDate(lease.endDate)}</p>
              </div>
            </div>

            {lease.property && (
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="text-base font-medium">{lease.property.name}</p>
                <p className="text-sm text-gray-600">{lease.property.address}</p>
              </div>
            )}

            {lease.unit && (
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="text-base">{lease.unit.name}</p>
              </div>
            )}

            <Link href={`/leases/${lease.id}`}>
              <Button className="w-full">View Lease Details</Button>
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No active lease found</p>
        )}
      </CardContent>
    </Card>
  );
}

