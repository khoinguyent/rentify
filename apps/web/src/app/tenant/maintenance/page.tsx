'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TenantSidebar } from '@/components/sidebar/TenantSidebar';
import { format } from 'date-fns';
import Link from 'next/link';
import { Search, Filter, Wrench, Plus, Check, Clock, AlertCircle } from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  lease: {
    property: {
      name: string;
      address?: string;
    };
    unit: {
      name: string;
    };
  };
}

export default function TenantMaintenancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user) {
      setTenantId((session.user as any).id);
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!tenantId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/maintenance-requests`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setRequests(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch maintenance requests:', response.status);
          setRequests([]);
        }
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [tenantId]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'READ':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SOLVED':
        return 'bg-green-100 text-green-800';
      case 'FINISHED':
        return 'bg-gray-100 text-gray-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'OPEN': 'Open',
      'READ': 'Read by Landlord',
      'IN_PROGRESS': 'In Progress',
      'PROCESSING': 'Processing',
      'SOLVED': 'Solved',
      'FINISHED': 'Finished',
      'CLOSED': 'Closed',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-white';
      case 'LOW':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const filteredRequests = requests
    .filter((req) => {
      const matchesSearch =
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.lease.property.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5BA0A4] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex">
      <TenantSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Maintenance Requests</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              To create a request, go to your lease and click "Create Ticket"
            </span>
            <Link href="/tenant/leases">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] transition-colors">
                <Plus size={20} />
                View My Leases
              </button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, description, or property..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="block w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="READ">Read</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SOLVED">Solved</option>
              <option value="FINISHED">Finished</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <Wrench size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No maintenance requests found</p>
            <p className="text-sm text-gray-500 mt-2">Create a new request to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredRequests.map((req) => (
              <Link key={req.id} href={`/tenant/maintenance/${req.id}`} className="block">
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-[#5BA0A4]/10 rounded-lg">
                      <Wrench className="text-[#5BA0A4]" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{req.title}</h3>
                      <p className="text-gray-600 mb-2">{req.lease.property.name} - {req.lease.unit.name}</p>
                      <p className="text-sm text-gray-500">{req.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(req.priority)}`}>
                      {req.priority}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                      {getStatusLabel(req.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Created: {formatDate(req.createdAt)}
                    </span>
                    {req.resolvedAt && (
                      <span className="flex items-center gap-1">
                        <Check size={14} />
                        Resolved: {formatDate(req.resolvedAt)}
                      </span>
                    )}
                  </div>
                  {req.status === 'SOLVED' && (
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/maintenance-requests/${req.id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ status: 'FINISHED' }),
                          });
                          if (response.ok) {
                            setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'FINISHED' } : r));
                          }
                        } catch (error) {
                          console.error('Error confirming completion:', error);
                          alert('Failed to confirm completion. Please try again.');
                        }
                      }}
                      className="px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] transition-colors text-sm font-medium"
                    >
                      Confirm Completion
                    </button>
                  )}
                </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

