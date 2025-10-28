'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Wrench, Search, Filter, Play, CheckCircle, Eye, Clock } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

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
    tenant: {
      fullName: string;
      email: string;
      phone: string;
    };
  };
}

export default function MaintenancePage() {
  const { data: session, status: authStatus } = useSession();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/maintenance-requests/all', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setRequests(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/maintenance-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests
    .filter(req => {
      const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.lease.property.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
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
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Maintenance Requests</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
        </div>
      ) : (
        <div className="space-y-8">
          {filteredRequests.map((req) => (
          <Link key={req.id} href={`/maintenance/${req.id}`} className="block">
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
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    Created: {format(new Date(req.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                  {req.resolvedAt && (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={14} />
                      Resolved: {format(new Date(req.resolvedAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p>Tenant: {req.lease.tenant.fullName}</p>
                </div>
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

