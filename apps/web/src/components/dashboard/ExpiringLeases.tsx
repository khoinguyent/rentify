import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpiringLeases } from '@/lib/hooks/useDashboard';

interface ExpiringLeasesProps {
  landlordId: string;
}

export function ExpiringLeases({ landlordId }: ExpiringLeasesProps) {
  const { data: leases, error, isLoading } = useExpiringLeases(landlordId);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expiring Leases</CardTitle>
          <CardDescription>Leases expiring in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load expiring leases</p>
          <p className="text-sm text-gray-500">API connection issue</p>
        </CardContent>
      </Card>
    );
  }

  if (!leases && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expiring Leases</CardTitle>
          <CardDescription>Leases expiring in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data available</p>
          <p className="text-sm text-gray-400">Connect to API to see expiring leases</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expiring Leases</CardTitle>
          <CardDescription>Leases expiring in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expiring Leases</CardTitle>
        <CardDescription>Leases expiring in the next 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {leases && leases.length > 0 ? (
          <div className="space-y-3">
            {leases.slice(0, 5).map((lease) => (
              <div key={lease.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{lease.unit}</p>
                  <p className="text-sm text-muted-foreground">{lease.tenant}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{lease.endDate}</p>
                  <p className="text-xs text-muted-foreground">
                    {lease.daysUntilExpiry} days left
                  </p>
                </div>
              </div>
            ))}
            {leases.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                +{leases.length - 5} more leases expiring
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No leases expiring in the next 30 days</p>
        )}
      </CardContent>
    </Card>
  );
}
