'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TenantSidebar } from '@/components/sidebar/TenantSidebar';
import { Menu, Calendar, DollarSign, Home, Building, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
  property: {
    id: string;
    name: string;
    address?: string;
  };
  unit: {
    id: string;
    name: string;
  };
}

export default function TenantLeasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLeases = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/tenants/${session.user.id}/leases`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setLeases(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch leases');
          setLeases([]);
        }
      } catch (error) {
        console.error('Error fetching leases:', error);
        setLeases([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchLeases();
    }
  }, [status, session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'TERMINATED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Sort leases: active first, then by end date
  const sortedLeases = [...leases].sort((a, b) => {
    // Active leases first
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
    
    // Then by end date (ascending)
    const aEndDate = new Date(a.endDate).getTime();
    const bEndDate = new Date(b.endDate).getTime();
    return aEndDate - bEndDate;
  });

  // Filter leases
  const filteredLeases = sortedLeases.filter(lease => {
    const matchesSearch = 
      lease.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.property.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lease.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TenantSidebar isMobileOpen={isMobileOpen} onMobileToggle={() => setIsMobileOpen(false)} />

      <div className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-black">My Leases</h1>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by property, unit, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-[#5BA0A4]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-[#5BA0A4]"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leases List */}
          {filteredLeases.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Home className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leases found</h3>
              <p className="text-gray-600">{searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'You don\'t have any leases yet.'}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLeases.map((lease) => (
                <Link
                  key={lease.id}
                  href={`/tenant/leases/${lease.id}`}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow border border-transparent hover:border-[#5BA0A4]/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="text-[#5BA0A4]" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {lease.property.name} - {lease.unit.name}
                        </h3>
                      </div>
                      {lease.property.address && (
                        <p className="text-sm text-gray-500 mb-3">{lease.property.address}</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="text-sm font-medium">{formatDate(lease.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <div>
                            <p className="text-xs text-gray-500">End Date</p>
                            <p className="text-sm font-medium">{formatDate(lease.endDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Monthly Rent</p>
                            <p className="text-sm font-medium">{formatCurrency(lease.rentAmount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(lease.status)}`}>
                        {lease.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

