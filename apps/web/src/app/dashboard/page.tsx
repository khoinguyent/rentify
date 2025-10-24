'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/Sidebar';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { ExpiringLeases } from '@/components/dashboard/ExpiringLeases';
import { VacantUnits } from '@/components/dashboard/VacantUnits';
import { MaintenanceSummary } from '@/components/dashboard/MaintenanceSummary';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useDashboardSummary, useDashboardRefresh } from '@/lib/hooks/useDashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const { refreshAll } = useDashboardRefresh(landlordId || '');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // For now, we'll use the seeded landlord ID
  // In a real app, this would come from the user's profile or session
  useEffect(() => {
    if (session?.user) {
      // Use the seeded landlord ID from the database
      setLandlordId('cmh1tt63o00031fzlbvpu8lik');
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={refreshAll} variant="outline" size="sm">
              Refresh Data
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
        <div className="mb-8">
          <p className="text-gray-600">
            Manage your properties and track your rental business
          </p>
        </div>

        {/* KPI Summary */}
        {landlordId && <DashboardSummary landlordId={landlordId} />}

        {/* Dashboard Sections */}
        {landlordId && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <ExpiringLeases landlordId={landlordId} />
            <VacantUnits landlordId={landlordId} />
            <MaintenanceSummary landlordId={landlordId} />
          </div>
        )}

        {/* Recent Activity */}
        {landlordId && (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
            <RecentActivity landlordId={landlordId} />
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Revenue chart will be implemented here</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Add Property
              </CardTitle>
              <CardDescription>
                Add a new property to your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create Lease
              </CardTitle>
              <CardDescription>
                Create a new lease agreement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create Lease</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Generate Invoice
              </CardTitle>
              <CardDescription>
                Generate invoices for your tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Generate</Button>
            </CardContent>
          </Card>
        </div>
        </main>
      </div>
    </div>
  );
}

