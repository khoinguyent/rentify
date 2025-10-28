'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TenantSidebar } from '@/components/sidebar/TenantSidebar';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Wrench, Check, Clock, AlertCircle, User, Phone, Mail, MapPin, Building } from 'lucide-react';

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

interface Document {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  createdAt: string;
}

export default function TenantMaintenanceDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [ticket, setTicket] = useState<MaintenanceRequest | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!params.id) return;

      try {
        const [ticketResponse, docsResponse] = await Promise.all([
          fetch(`/api/maintenance-requests`, { credentials: 'include' }),
          fetch(`/api/documents/MaintenanceRequest/${params.id}`, { credentials: 'include' }),
        ]);

        if (ticketResponse.ok) {
          const tickets = await ticketResponse.json();
          const foundTicket = Array.isArray(tickets) 
            ? tickets.find((t: MaintenanceRequest) => t.id === params.id)
            : null;
          setTicket(foundTicket);
        }

        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          setDocuments(docsData || []);
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

  const handleConfirmCompletion = async () => {
    if (!ticket) return;

    try {
      const response = await fetch(`/api/maintenance-requests/${ticket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'FINISHED' }),
      });

      if (response.ok) {
        setTicket({ ...ticket, status: 'FINISHED', resolvedAt: new Date().toISOString() });
        alert('Maintenance completed confirmed!');
      }
    } catch (error) {
      console.error('Error confirming completion:', error);
      alert('Failed to confirm completion. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5BA0A4] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB]">
        <TenantSidebar />
        <main className="ml-64 p-8">
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">Ticket not found</p>
          </div>
        </main>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex">
      <TenantSidebar />
      <main className="flex-1 p-8 ml-64">
        <Link href="/tenant/maintenance">
          <button className="flex items-center text-gray-600 hover:text-[#5BA0A4] mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Maintenance Requests
          </button>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#5BA0A4]/10 rounded-lg">
                <Wrench className="text-[#5BA0A4]" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Building size={16} />
                  {ticket.lease.property.name} - {ticket.lease.unit.name}
                </p>
                {ticket.lease.property.address && (
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <MapPin size={14} />
                    {ticket.lease.property.address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
              <p className="text-gray-900 flex items-center gap-2">
                <Clock size={16} />
                {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            {ticket.updatedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
                <p className="text-gray-900">{format(new Date(ticket.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            )}
            {ticket.resolvedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Resolved</h3>
                <p className="text-gray-900 flex items-center gap-2">
                  <Check size={16} />
                  {format(new Date(ticket.resolvedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>

          {documents.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments ({documents.length})</h3>
              <div className="grid grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group rounded-lg overflow-hidden aspect-video bg-gray-100"
                  >
                    {doc.mimeType.startsWith('image/') ? (
                      <img 
                        src={doc.url} 
                        alt={doc.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200"><span class="text-gray-500">Failed to load image</span></div>`;
                          }
                        }}
                      />
                    ) : doc.mimeType.startsWith('video/') ? (
                      <video 
                        src={doc.url} 
                        className="w-full h-full object-cover" 
                        muted
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200"><span class="text-gray-500">Failed to load video</span></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">Unsupported file type</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium">View</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {ticket.status === 'SOLVED' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Check className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      The landlord has marked this issue as solved
                    </h3>
                    <p className="text-green-700 mb-4">
                      Please confirm that the maintenance work has been completed satisfactorily.
                    </p>
                    <button
                      onClick={handleConfirmCompletion}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Confirm Completion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

