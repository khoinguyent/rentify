'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTenantUpcomingPayments } from '@/lib/hooks/useTenantDashboard';
import { Button } from '@/components/ui/button';

interface UpcomingPaymentsProps {
  tenantId: string;
}

export function UpcomingPayments({ tenantId }: UpcomingPaymentsProps) {
  const { data: payments, error, isLoading } = useTenantUpcomingPayments(tenantId);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Your scheduled payments</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Failed to load payments</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Your scheduled payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Your scheduled payments</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No upcoming payments</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (date: string | Date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
        <CardDescription>Your scheduled payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.slice(0, 3).map((payment: any) => {
            const daysUntil = getDaysUntil(payment.dueDate);
            const isOverdue = daysUntil < 0;
            const isSoon = daysUntil >= 0 && daysUntil <= 7;

            return (
              <div
                key={payment.id}
                className={`p-4 rounded-lg border ${
                  isOverdue
                    ? 'border-red-200 bg-red-50'
                    : isSoon
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.description || 'Rent Payment'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs font-medium ${
                      isOverdue
                        ? 'text-red-700'
                        : isSoon
                        ? 'text-yellow-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {isOverdue
                      ? `Overdue ${Math.abs(daysUntil)} days`
                      : isSoon
                      ? `Due in ${daysUntil} days`
                      : `${daysUntil} days remaining`}
                  </span>
                  <Button
                    size="sm"
                    variant={isOverdue ? 'default' : 'outline'}
                    className="h-8"
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

