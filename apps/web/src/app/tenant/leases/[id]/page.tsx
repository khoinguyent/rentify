'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TenantSidebar } from '@/components/sidebar/TenantSidebar';
import { ArrowLeft, Calendar, DollarSign, FileText, User, Home, Building, Phone, Mail, ExternalLink, Menu, X, Wrench, Plus, Upload, Image, Video, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
  depositAmount?: number;
  discountType?: string;
  discountValue?: number;
  lateFeeAmount?: number;
  billingDay?: number;
  billingCycleMonths?: number;
  signedAt?: string;
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

interface LeaseFee {
  id: string;
  name: string;
  type: string;
  amount: string | null;
  unitPrice: string | null;
  billingUnit: string | null;
}

interface Document {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  createdAt: string;
  documentType?: {
    id: string;
    name: string;
    code: string;
  };
}

export default function TenantLeaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const [lease, setLease] = useState<Lease | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [fees, setFees] = useState<LeaseFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'documents'>('info');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketAmenity, setTicketAmenity] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketFiles, setTicketFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLeaseData = async () => {
      if (!params.id || !session?.user?.id) return;

      try {
        const [leaseResponse, docsResponse, feesResponse] = await Promise.all([
          fetch(`/api/leases/${params.id}`, { credentials: 'include' }),
          fetch(`/api/documents/Lease/${params.id}`, { credentials: 'include' }),
          fetch(`/api/leases/${params.id}/fees`, { credentials: 'include' }),
        ]);

        if (leaseResponse.ok) {
          const leaseData = await leaseResponse.json();
          setLease(leaseData);
        }

        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          setDocuments(docsData || []);
        }

        if (feesResponse.ok) {
          const feesData = await feesResponse.json();
          setFees(feesData || []);
        }
      } catch (error) {
        console.error('Error fetching lease data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLeaseData();
    }
  }, [params.id, session]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
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
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'TERMINATED':
        return 'bg-gray-100 text-gray-800';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate max files (3 images or 1 video)
    const hasVideo = files.some(file => file.type.startsWith('video/'));
    if (hasVideo && files.length > 1) {
      alert('You can only upload 1 video at a time.');
      return;
    }
    
    if (!hasVideo && files.length > 3) {
      alert('You can upload maximum 3 images.');
      return;
    }
    
    // Validate file size (max 200MB)
    const oversizedFiles = files.filter(file => file.size > 200 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Files must be under 200MB.');
      return;
    }
    
    setTicketFiles(files);
    
    // Create previews
    const previews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setFilePreviews(previews);
  };

  const removeFile = (index: number) => {
    const newFiles = [...ticketFiles];
    const newPreviews = [...filePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setTicketFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const uploadFiles = async (ticketId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < ticketFiles.length; i++) {
      const file = ticketFiles[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('objectType', 'MaintenanceRequest');
      formData.append('objectId', ticketId);
      formData.append('name', file.name);
      
      try {
        const uploadResponse = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          uploadedUrls.push(data.url);
          setUploadProgress([...uploadProgress, (i + 1) / ticketFiles.length * 100]);
        } else {
          console.error('Failed to upload file:', file.name);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    return uploadedUrls;
  };

  const handleCreateTicket = async () => {
    if (!ticketTitle || !ticketDescription || !lease) return;

    setSubmittingTicket(true);
    try {
      // Create the ticket first
      const response = await fetch(`/api/maintenance-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          leaseId: lease.id,
          title: ticketTitle,
          description: ticketDescription,
          amenityName: ticketAmenity || null,
          priority: 'MEDIUM',
        }),
      });

      if (!response.ok) {
        alert('Failed to create ticket. Please try again.');
        return;
      }
      
      const ticketData = await response.json();
      const ticketId = ticketData.id;

      // Upload files if any
      if (ticketFiles.length > 0) {
        await uploadFiles(ticketId);
      }

      // Clean up
      filePreviews.forEach(preview => URL.revokeObjectURL(preview));
      setShowTicketModal(false);
      setTicketTitle('');
      setTicketDescription('');
      setTicketAmenity('');
      setTicketFiles([]);
      setFilePreviews([]);
      setUploadProgress([]);
      
      alert('Ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket. Please try again.');
    } finally {
      setSubmittingTicket(false);
    }
  };

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

  if (!lease) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TenantSidebar isMobileOpen={isMobileOpen} onMobileToggle={() => setIsMobileOpen(false)} />
        <main className="lg:ml-64 p-8">
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">Lease not found</p>
          </div>
        </main>
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

        <main className="p-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/tenant/leases')}
              className="flex items-center text-gray-600 hover:text-[#5BA0A4] mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to My Leases
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Lease Details</h1>
                <p className="text-gray-600">
                  {lease.property.name} - {lease.unit.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] transition-colors font-medium"
                >
                  <Plus size={16} />
                  Create Ticket
                </button>
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(lease.status)}`}
                >
                  {lease.status}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-4 px-6 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-b-2 border-[#5BA0A4] text-[#5BA0A4]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Lease Info
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-4 px-6 font-medium text-sm ${
                    activeTab === 'documents'
                      ? 'border-b-2 border-[#5BA0A4] text-[#5BA0A4]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Documents ({documents.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Property & Unit */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Home className="text-[#5BA0A4]" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">Property & Unit</h3>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Building className="text-[#5BA0A4]" size={24} />
                        <div>
                          <p className="font-medium text-gray-900">{lease.property.name}</p>
                          <p className="text-sm text-gray-500">Unit: {lease.unit.name}</p>
                          {lease.property.address && (
                            <p className="text-sm text-gray-500">{lease.property.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <Calendar className="text-[#5BA0A4] mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Lease Period</p>
                          <p className="font-medium">{formatDate(lease.startDate)} - {formatDate(lease.endDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign className="text-[#5BA0A4] mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Monthly Rent</p>
                          <p className="font-medium">{formatCurrency(lease.rentAmount)}</p>
                        </div>
                      </div>
                      {lease.depositAmount && (
                        <div className="flex items-start gap-3">
                          <DollarSign className="text-[#5BA0A4] mt-1" size={20} />
                          <div>
                            <p className="text-sm text-gray-500">Security Deposit</p>
                            <p className="font-medium">{formatCurrency(lease.depositAmount)}</p>
                          </div>
                        </div>
                      )}
                      {lease.billingDay && (
                        <div className="flex items-start gap-3">
                          <Calendar className="text-[#5BA0A4] mt-1" size={20} />
                          <div>
                            <p className="text-sm text-gray-500">Billing Cycle</p>
                            <p className="font-medium">Day {lease.billingDay} of every {lease.billingCycleMonths || 1} month(s)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lease Fees */}
                  {fees.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="text-[#5BA0A4]" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900">Additional Fees</h3>
                      </div>
                      <div className="space-y-3">
                        {fees.map((fee) => (
                          <div
                            key={fee.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{fee.name}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Type: {fee.type === 'FIXED' ? 'Fixed Monthly' : 'Variable (Usage-based)'}
                                {fee.billingUnit && ` • Unit: ${fee.billingUnit}`}
                              </p>
                            </div>
                            <div className="text-right">
                              {fee.amount ? (
                                <p className="text-lg font-semibold text-gray-900">
                                  +{formatCurrency(Number(fee.amount))}
                                  {fee.type === 'VARIABLE' && fee.unitPrice && (
                                    <span className="text-sm text-gray-500 ml-1">
                                      /{fee.billingUnit}
                                    </span>
                                  )}
                                </p>
                              ) : fee.unitPrice ? (
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(Number(fee.unitPrice))}/{fee.billingUnit}
                                </p>
                              ) : (
                                <p className="text-lg font-semibold text-gray-900">
                                  Variable
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {fees.some(f => f.amount) && (
                        <div className="mt-4 p-4 bg-[#5BA0A4]/10 rounded-lg border border-[#5BA0A4]/20">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">Monthly Total</p>
                            <p className="text-xl font-bold text-[#5BA0A4]">
                              {formatCurrency(
                                lease.rentAmount +
                                fees.reduce((sum, fee) => sum + (fee.amount ? Number(fee.amount) : 0), 0)
                              )}
                              {fees.some(f => f.type === 'VARIABLE') && (
                                <span className="ml-1 text-lg">++</span>
                              )}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Base Rent: {formatCurrency(lease.rentAmount)} + Fees: {formatCurrency(
                              fees.reduce((sum, fee) => sum + (fee.amount ? Number(fee.amount) : 0), 0)
                            )}
                            {fees.some(f => f.type === 'VARIABLE') && (
                              <span className="ml-1">+ variable charges</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Documents</h3>
                  </div>

                  {documents.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-lg text-gray-600">No documents found</p>
                      <p className="text-sm text-gray-500 mt-2">Documents will appear here once uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#5BA0A4] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="text-[#5BA0A4]" size={20} />
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              {doc.documentType && (
                                <p className="text-sm text-gray-500">{doc.documentType.name}</p>
                              )}
                              <p className="text-xs text-gray-400">
                                Uploaded {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] transition-colors"
                          >
                            View
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="text-[#5BA0A4]" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Create Maintenance Ticket</h2>
              </div>
              <button
                onClick={() => {
                  filePreviews.forEach(preview => URL.revokeObjectURL(preview));
                  setShowTicketModal(false);
                  setTicketTitle('');
                  setTicketDescription('');
                  setTicketAmenity('');
                  setTicketFiles([]);
                  setFilePreviews([]);
                  setUploadProgress([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property & Unit
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{lease.property.name}</p>
                  <p className="text-sm text-gray-500">Unit: {lease.unit.name}</p>
                </div>
              </div>

              <div>
                <label htmlFor="ticketTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="ticketTitle"
                  type="text"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="e.g., Broken coffee machine"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-[#5BA0A4]"
                  required
                />
              </div>

              <div>
                <label htmlFor="ticketDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="ticketDescription"
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-[#5BA0A4]"
                  required
                />
              </div>

              <div>
                <label htmlFor="ticketAmenity" className="block text-sm font-medium text-gray-700 mb-2">
                  Related Amenity (Optional)
                </label>
                <input
                  id="ticketAmenity"
                  type="text"
                  value={ticketAmenity}
                  onChange={(e) => setTicketAmenity(e.target.value)}
                  placeholder="e.g., Coffee Maker, Light Fixture, or leave empty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-[#5BA0A4]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Specify which amenity needs attention, or leave blank for general maintenance
                </p>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="space-y-3">
                  {/* File Input */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#5BA0A4] transition-colors">
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <Upload className="text-[#5BA0A4] mb-2" size={32} />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Click to upload images or video
                        </p>
                        <p className="text-xs text-gray-500">
                          Maximum 3 images or 1 video, under 200MB each
                        </p>
                      </div>
                    </label>
                    <input
                      id="fileUpload"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={submittingTicket}
                    />
                  </div>

                  {/* File Previews */}
                  {filePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {filePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-video"
                        >
                          {ticketFiles[index].type.startsWith('image/') ? (
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : ticketFiles[index].type.startsWith('video/') ? (
                            <video
                              src={preview}
                              className="w-full h-full object-cover"
                              controls
                              muted
                            />
                          ) : null}
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {filePreviews.length > 1 ? `${index + 1}/${filePreviews.length}` : ''}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {ticketFiles[index].type.startsWith('video/') ? (
                              <Video size={12} />
                            ) : (
                              <Image size={12} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  filePreviews.forEach(preview => URL.revokeObjectURL(preview));
                  setShowTicketModal(false);
                  setTicketTitle('');
                  setTicketDescription('');
                  setTicketAmenity('');
                  setTicketFiles([]);
                  setFilePreviews([]);
                  setUploadProgress([]);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={submittingTicket}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!ticketTitle || !ticketDescription || submittingTicket}
                className="px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingTicket ? 'Submitting...' : 'Create Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

