'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Home, CreditCard, Calendar, Wrench, AlertTriangle } from 'lucide-react';

interface StatsCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'overdue' | 'active';
}

interface TenantDashboardStatsProps {
  stats: {
    activeLeases: number;
    totalSpentLastMonth: number;
    nextBillDate: string;
    ticketsOpen: number;
    overdueBills: number;
    overdueAmount?: number;
  };
}

export function TenantDashboardStats({ stats }: TenantDashboardStatsProps) {
  const statsCards: StatsCard[] = [
    {
      title: 'Active Leases',
      value: stats.activeLeases,
      subtitle: 'Current rentals',
      icon: Home,
      variant: 'active',
    },
    {
      title: 'Total Spent Last Month',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(stats.totalSpentLastMonth),
      subtitle: 'October 2024',
      icon: CreditCard,
    },
    {
      title: 'Next Bill Date',
      value: stats.nextBillDate,
      subtitle: 'Upcoming payment',
      icon: Calendar,
    },
    {
      title: 'Tickets Open',
      value: stats.ticketsOpen,
      subtitle: 'Maintenance requests',
      icon: Wrench,
    },
    {
      title: 'Overdue Bills',
      value: `${stats.overdueBills} ${stats.overdueBills === 1 ? 'bill' : 'bills'}`,
      subtitle: stats.overdueAmount
        ? `$${stats.overdueAmount.toLocaleString()}`
        : 'All clear',
      icon: AlertTriangle,
      variant: stats.overdueBills > 0 ? 'overdue' : 'default',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        const isOverdue = card.variant === 'overdue';
        const isActive = card.variant === 'active';

        return (
          <Card
            key={index}
            className={`rounded-2xl shadow-sm ${
              isOverdue
                ? 'bg-red-50 border border-red-200'
                : isActive
                ? 'bg-[#E9F5F6] border border-[#5BA0A4]/20'
                : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    isOverdue
                      ? 'bg-red-100 text-red-600'
                      : isActive
                      ? 'bg-[#5BA0A4] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p
                  className={`text-2xl font-bold mb-1 ${
                    isOverdue ? 'text-red-700' : 'text-gray-900'
                  }`}
                >
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

