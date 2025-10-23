import { KPICard } from './KPICard';
import { useKPIs } from '@/lib/hooks/useDashboard';

interface DashboardSummaryProps {
  landlordId: string;
}

export function DashboardSummary({ landlordId }: DashboardSummaryProps) {
  const { data: kpis, error, isLoading } = useKPIs(landlordId);

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="col-span-full text-center py-8">
          <p className="text-red-600">Failed to load dashboard data</p>
          <p className="text-sm text-gray-500 mt-2">API connection issue</p>
        </div>
      </div>
    );
  }

  if (!kpis && !isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">No dashboard data available</p>
          <p className="text-sm text-gray-400 mt-2">Connect to API to see metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <KPICard
        title="Total Properties"
        value={kpis?.totalProperties || 0}
        change="+2 from last month"
        icon={
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        loading={isLoading}
      />

      <KPICard
        title="Occupancy Rate"
        value={`${Math.round((kpis?.occupancyRate || 0) * 100)}%`}
        change="+3% from last month"
        icon={
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        loading={isLoading}
      />

      <KPICard
        title="Expected Rent"
        value={`$${(kpis?.expectedRent || 0).toLocaleString()}`}
        change="+12% from last month"
        icon={
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        }
        loading={isLoading}
      />

      <KPICard
        title="Unpaid Rent"
        value={`$${(kpis?.unpaidRent || 0).toLocaleString()}`}
        change="Needs attention"
        icon={
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
        loading={isLoading}
      />
    </div>
  );
}
