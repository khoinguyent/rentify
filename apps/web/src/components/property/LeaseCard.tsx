import React from 'react';
import { Calendar, FileText, DollarSign, Plus } from 'lucide-react';

interface LeaseCardProps {
  lease?: {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    documentUrl?: string | null;
    documents?: Array<{ id: string; name: string; url?: string | null; fileUrl?: string | null; mimeType?: string | null; size?: number | null }>; 
    status: string;
    tenantInfo?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dateOfBirth?: string;
      gender?: string;
      nationality?: string;
      idType?: string;
      idNumber?: string;
    };
  };
  onAddLease?: () => void;
  onAddNewContract?: (lease: any) => void;
}

export function LeaseCard({ lease, onAddLease, onAddNewContract }: LeaseCardProps) {

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}/month`;
  };

  const getPrimaryDocUrl = (): string | null => {
    const direct = lease?.documentUrl && String(lease.documentUrl).trim().length > 0 ? lease!.documentUrl! : null;
    if (direct) return direct;
    const firstDoc = lease?.documents && lease.documents.length > 0 ? lease.documents[0] : undefined;
    const best = firstDoc?.fileUrl || firstDoc?.url || null;
    return best || null;
  };

  const openPdf = () => {
    const href = getPrimaryDocUrl();
    if (href) {
      window.open(href, '_blank');
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-md p-6 md:p-8 overflow-hidden">
      {/* Teal accent border on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#5BA0A4] rounded-l-2xl" />
      
      <div className="ml-2">
        <h2 className="text-2xl font-semibold text-[#1E293B] mb-6">
          <span className="text-sm uppercase tracking-wider text-[#64748B] font-semibold">Lease Contract</span>
        </h2>

        {!lease ? (
          <div className="text-center py-8">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Lease</h3>
            <p className="text-gray-500 mb-6">This property doesn't have an active lease contract yet.</p>
            {onAddLease && (
              <button
                onClick={onAddLease}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5BA0A4] text-white rounded-xl hover:bg-[#4a8e91] transition-colors font-medium"
              >
                <Plus size={20} />
                <span>Add New Lease</span>
              </button>
            )}
          </div>
        ) : (
        <div className="space-y-4">
          {/* Lease Period */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-[#5BA0A4]" />
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide font-semibold mb-0.5">Lease Period</p>
                <div className="flex items-center gap-3">
                  <span className="text-[#1E293B] font-semibold">
                    {formatDate(lease.startDate)}
                  </span>
                  <span className="text-[#64748B]">→</span>
                  <span className="text-[#1E293B] font-semibold">
                    {formatDate(lease.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Amount */}
          <div className="flex items-center gap-3">
            <DollarSign size={20} className="text-[#5BA0A4]" />
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wide font-semibold mb-0.5">Monthly Rent</p>
              <p className="text-[#1E293B] font-semibold text-lg">
                {formatAmount(lease.rentAmount)}
              </p>
            </div>
          </div>

          {/* Document Section */}
          <div className="border-t border-[#E9F5F6] pt-4 mt-4">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-[#5BA0A4]" />
              <div className="flex-1">
                <p className="text-xs text-[#64748B] uppercase tracking-wide font-semibold mb-2">Lease Documents</p>
                {getPrimaryDocUrl() ? (
                  <button
                    onClick={openPdf}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] transition-colors text-sm font-medium"
                  >
                    <FileText size={16} />
                    <span>View Lease Contract</span>
                  </button>
                ) : (
                  <p className="text-sm text-[#64748B]">No documents available</p>
                )}
              </div>
            </div>
          </div>

          {/* Add New Contract Button */}
          {onAddNewContract && lease && lease.status === 'ACTIVE' && (
            <div className="border-t border-[#E9F5F6] pt-4 mt-4">
              <button
                onClick={() => onAddNewContract(lease)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5BA0A4] text-white rounded-xl hover:bg-[#4a8e91] transition-colors font-medium"
              >
                <Plus size={20} />
                <span>Add New Lease Contract</span>
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
