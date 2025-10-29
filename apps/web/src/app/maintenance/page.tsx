'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Wrench, Building, Search, Filter } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface TicketCardProps {
  ticket: MaintenanceRequest;
}

function TicketCard({ ticket }: TicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'READ':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'SOLVED':
        return 'bg-green-100 text-green-800';
      case 'FINISHED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/maintenance/${ticket.id}`} className="block" ref={setNodeRef} style={style}>
      <div
        className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3 border border-gray-200"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start gap-2 mb-2">
          <Wrench className="text-[#5BA0A4] flex-shrink-0 mt-0.5" size={16} />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate">{ticket.title}</h4>
            <p className="text-xs text-gray-600 truncate">{ticket.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1">
            <Building size={12} />
            {ticket.lease.property.name}
          </span>
          <span className="text-xs">{format(new Date(ticket.createdAt), 'MMM dd')}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">{ticket.lease.tenant.fullName}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>
      </div>
    </Link>
  );
}

interface ColumnProps {
  id: string;
  title: string;
  tickets: MaintenanceRequest[];
  searchTerm: string;
}

function Column({ id, title, tickets, searchTerm }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const style = {
    opacity: isOver ? 0.6 : 1,
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.lease.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.lease.unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.lease.tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by property
  const groupedByProperty: Record<string, Record<string, MaintenanceRequest[]>> = {};
  
  filteredTickets.forEach(ticket => {
    const propertyKey = ticket.lease.property.name;
    const unitKey = ticket.lease.unit.name;
    
    if (!groupedByProperty[propertyKey]) {
      groupedByProperty[propertyKey] = {};
    }
    
    if (!groupedByProperty[propertyKey][unitKey]) {
      groupedByProperty[propertyKey][unitKey] = [];
    }
    
    groupedByProperty[propertyKey][unitKey].push(ticket);
  });

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col h-full">
      <div className="bg-gray-50 p-3 rounded-t-lg border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{filteredTickets.length} ticket(s)</p>
      </div>
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2">
        <SortableContext items={filteredTickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {Object.entries(groupedByProperty).map(([property, units]) => (
            <div key={property} className="mb-4">
              <div className="flex items-center gap-1 mb-2 px-2">
                <Building size={12} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-700">{property}</span>
              </div>
              {Object.entries(units).map(([unit, unitTickets]) => (
                <div key={unit} className="pl-3 border-l-2 border-gray-300 mb-2">
                  <span className="text-xs text-gray-600 font-medium block mb-1">{unit}</span>
                  {unitTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const { data: session, status: authStatus } = useSession();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { id: 'OPEN', title: 'Open', statuses: ['OPEN'] },
    { id: 'READ', title: 'Read', statuses: ['READ'] },
    { id: 'IN_PROGRESS', title: 'In Progress', statuses: ['IN_PROGRESS', 'PROCESSING'] },
    { id: 'SOLVED', title: 'Solved', statuses: ['SOLVED'] },
    { id: 'FINISHED', title: 'Finished', statuses: ['FINISHED', 'CLOSED'] },
  ];

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // If not dropped on a valid target, do nothing
    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as string;

    // Check if the drop target is a valid column (not another ticket)
    const isValidColumn = columns.some(col => col.id === newStatus);
    if (!isValidColumn) return;

    const ticket = requests.find(r => r.id === ticketId);
    if (!ticket) return;

    // Don't update if status hasn't changed
    if (ticket.status === newStatus) return;

    // Store the original state in case we need to revert
    const originalStatus = ticket.status;

    // Optimistically update the UI
    setRequests(prevRequests =>
      prevRequests.map(r => r.id === ticketId ? { ...r, status: newStatus } : r)
    );

    try {
      const response = await fetch(`/api/maintenance-requests/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        // Revert on failure
        console.error('Failed to update status:', response.status);
        setRequests(prevRequests =>
          prevRequests.map(r => r.id === ticketId ? { ...r, status: originalStatus } : r)
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      setRequests(prevRequests =>
        prevRequests.map(r => r.id === ticketId ? { ...r, status: originalStatus } : r)
      );
    }
  };

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

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, description, property, unit, or tenant..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-5 gap-4">
            {columns.map(column => {
              const columnTickets = requests.filter(ticket =>
                column.statuses.includes(ticket.status)
              );
              
              return (
                <Column
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  tickets={columnTickets}
                  searchTerm={searchTerm}
                />
              );
            })}
          </div>
          <DragOverlay>
            {activeId ? (
              <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-[#5BA0A4] opacity-90">
                {requests.find(t => t.id === activeId)?.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
