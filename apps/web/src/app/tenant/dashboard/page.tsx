'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TenantSidebar } from '@/components/sidebar/TenantSidebar';
import { TenantKPICards, MyLease, UpcomingPayments } from '@/components/tenant';
import { useTenantDashboardRefresh } from '@/lib/hooks/useTenantDashboard';
import { Menu } from 'lucide-react';

export default function TenantDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { refreshAll } = useTenantDashboardRefresh(tenantId || '');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Get tenant ID from session
  useEffect(() => {
    if (session?.user) {
      // Use the user ID as the tenant ID
      // The API will validate access based on the user's role and ID
      setTenantId(session.user.id);
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
      <TenantSidebar isMobileOpen={isMobileOpen} onMobileToggle={() => setIsMobileOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-black">Tenant Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={refreshAll} variant="outline" size="sm" className="hidden md:flex">
              Refresh Data
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {session?.user?.name?.split(' ')[0] || 'Tenant'}!</h1>
            <p className="text-gray-600">
              Here's an overview of your rental activity and key information
            </p>
          </div>

          {/* KPI Summary */}
          {tenantId && <TenantKPICards tenantId={tenantId} />}

          {/* Dashboard Sections */}
          {tenantId && (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
              <MyLease tenantId={tenantId} />
              <UpcomingPayments tenantId={tenantId} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Invoices</h3>
                  <p className="text-sm text-gray-600">Check your billing history</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                View All Invoices
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Request Maintenance</h3>
                  <p className="text-sm text-gray-600">Report issues or repairs</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Submit Request
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Update Profile</h3>
                  <p className="text-sm text-gray-600">Manage your account settings</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Edit Profile
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

