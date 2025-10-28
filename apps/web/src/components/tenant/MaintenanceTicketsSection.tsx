'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Home } from 'lucide-react';

interface MaintenanceTicket {
  id: string;
  title: string;
  propertyName: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
}

interface MaintenanceTicketsSectionProps {
  tickets: MaintenanceTicket[];
}

export function MaintenanceTicketsSection({ tickets }: MaintenanceTicketsSectionProps) {
  if (tickets.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm bg-white mb-10">
        <CardContent className="p-8 text-center">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No maintenance tickets</p>
          <p className="text-sm text-gray-500 mt-1">All clear!</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-700';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'Resolved':
        return 'bg-green-100 text-green-700';
      case 'Closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm bg-white mb-10">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Maintenance Tickets
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          {tickets.length} {tickets.length === 1 ? 'active ticket' : 'active tickets'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-100">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Home className="h-4 w-4 mr-1.5" />
                    {ticket.propertyName}
                  </div>
                </div>
                <div className="ml-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Created {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

