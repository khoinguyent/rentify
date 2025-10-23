import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMaintenanceSummary } from '@/lib/hooks/useDashboard';

interface MaintenanceSummaryProps {
  landlordId: string;
}

export function MaintenanceSummary({ landlordId }: MaintenanceSummaryProps) {
  const { data: maintenance, error, isLoading } = useMaintenanceSummary(landlordId);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
          <CardDescription>Current maintenance status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load maintenance data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
          <CardDescription>Current maintenance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
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
        <CardTitle>Maintenance Requests</CardTitle>
        <CardDescription>Current maintenance status</CardDescription>
      </CardHeader>
      <CardContent>
        {maintenance ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{maintenance.open}</div>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{maintenance.inProgress}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{maintenance.overdue}</div>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{maintenance.resolved}</div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No maintenance data available</p>
        )}
      </CardContent>
    </Card>
  );
}
