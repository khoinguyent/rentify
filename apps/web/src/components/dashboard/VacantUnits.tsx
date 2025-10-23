import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVacantUnits } from '@/lib/hooks/useDashboard';

interface VacantUnitsProps {
  landlordId: string;
}

export function VacantUnits({ landlordId }: VacantUnitsProps) {
  const { data: units, error, isLoading } = useVacantUnits(landlordId);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vacant Units</CardTitle>
          <CardDescription>Available units ready for rent</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load vacant units</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vacant Units</CardTitle>
          <CardDescription>Available units ready for rent</CardDescription>
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
        <CardTitle>Vacant Units</CardTitle>
        <CardDescription>Available units ready for rent</CardDescription>
      </CardHeader>
      <CardContent>
        {units && units.length > 0 ? (
          <div className="space-y-3">
            {units.slice(0, 5).map((unit) => (
              <div key={unit.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{unit.unit}</p>
                  <p className="text-sm text-muted-foreground">{unit.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${unit.rentAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {unit.daysVacant} days vacant
                  </p>
                </div>
              </div>
            ))}
            {units.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                +{units.length - 5} more vacant units
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No vacant units available</p>
        )}
      </CardContent>
    </Card>
  );
}
