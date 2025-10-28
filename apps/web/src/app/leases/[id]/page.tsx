'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/Sidebar';
import { ArrowLeft, Calendar, DollarSign, FileText, User, Home, Building, Phone, Mail, ExternalLink, Upload, X } from 'lucide-react';
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
  tenant: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    idType?: string;
    idNumber?: string;
  };
  landlord?: {
    id: string;
    name: string;
    email: string;
  };
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

interface DocumentType {
  id: string;
  name: string;
  code: string;
}

interface LeaseFee {
  id: string;
  name: string;
  type: string;
  amount: string | null;
  unitPrice: string | null;
  billingUnit: string | null;
}

export default function LeaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [lease, setLease] = useState<Lease | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [fees, setFees] = useState<LeaseFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'documents'>('documents');
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLeaseData = async () => {
      try {
        const [leaseResponse, docsResponse, typesResponse, feesResponse] = await Promise.all([
          fetch(`/api/leases/${params.id}`, { credentials: 'include' }),
          fetch(`/api/documents/Lease/${params.id}`, { credentials: 'include' }),
          fetch(`/api/documents/types/Lease`, { credentials: 'include' }),
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

        if (typesResponse.ok) {
          const typesData = await typesResponse.json();
          console.log('Document types loaded:', typesData);
          setDocumentTypes(typesData || []);
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
  }, [params.id]);

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

  const sortedDocuments = [...documents].sort((a, b) => {
    // Main contract first
    if (a.documentType?.code === 'LEASE_CONTRACT') return -1;
    if (b.documentType?.code === 'LEASE_CONTRACT') return 1;
    // Then by date
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.map(file => {
        // Check if PDF or document file
        if (file.type === 'application/pdf' || file.type.includes('document') || file.type.includes('word')) {
          // Default to first document type if available, otherwise leave empty
          return {
            file,
            type: documentTypes.length > 0 ? documentTypes[0].id : '',
          };
        }
        return null;
      }).filter((item): item is { file: File; type: string } => item !== null);
      
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleTypeChange = (index: number, typeId: string) => {
    setSelectedFiles(selectedFiles.map((item, i) => 
      i === index ? { ...item, type: typeId } : item
    ));
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    // Check if all files have a document type selected
    const filesWithoutType = selectedFiles.filter(item => !item.type);
    if (filesWithoutType.length > 0) {
      alert('Please select a document type for all files before uploading.');
      return;
    }

    setUploading(true);
    try {
      for (const item of selectedFiles) {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('objectType', 'Lease');
        formData.append('objectId', params.id as string);
        if (item.type) {
          formData.append('documentTypeId', item.type);
        }

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to upload document');
        }
      }

      // Refresh documents list
      const docsResponse = await fetch(`/api/documents/Lease/${params.id}`, { credentials: 'include' });
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setDocuments(docsData || []);
      }

      setShowUploadModal(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5BA0A4] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading lease details...</p>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB]">
        <Sidebar />
        <main className="ml-64 p-8">
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">Lease not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F5F6] to-[#F8FBFB]">
      <Sidebar />
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-[#5BA0A4] mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Leases
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Lease Details</h1>
              <p className="text-gray-600">
                {lease.property.name} - {lease.unit.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
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
                    <button
                      onClick={() => router.push(`/properties/${lease.property.id}`)}
                      className="flex items-center gap-2 text-[#5BA0A4] hover:text-[#4a8e91] font-medium"
                    >
                      View Property
                      <ExternalLink size={16} />
                    </button>
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

                {/* Tenant Info */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="text-[#5BA0A4]" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">Tenant Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{lease.tenant.fullName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="text-gray-400" size={16} />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{lease.tenant.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-400" size={16} />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{lease.tenant.phone}</p>
                      </div>
                    </div>
                    {lease.tenant.dateOfBirth && (
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{formatDate(lease.tenant.dateOfBirth)}</p>
                      </div>
                    )}
                    {lease.tenant.gender && (
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium capitalize">{lease.tenant.gender}</p>
                      </div>
                    )}
                    {lease.tenant.nationality && (
                      <div>
                        <p className="text-sm text-gray-500">Nationality</p>
                        <p className="font-medium">{lease.tenant.nationality}</p>
                      </div>
                    )}
                    {lease.tenant.idNumber && (
                      <div>
                        <p className="text-sm text-gray-500">ID Number</p>
                        <p className="font-medium">{lease.tenant.idType || 'ID'}: {lease.tenant.idNumber}</p>
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
                  <button
                    onClick={() => {
                      setShowUploadModal(true);
                      setSelectedFiles([]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] transition-colors"
                  >
                    <Upload size={16} />
                    Upload Documents
                  </button>
                </div>

                {sortedDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-lg text-gray-600">No documents found</p>
                    <p className="text-sm text-gray-500 mt-2">Upload documents to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedDocuments.map((doc) => (
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

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
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
                    Select Files
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      handleFileSelect(e);
                      // Reset the input so the same file can be selected again if needed
                      if (e.target) {
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#5BA0A4] transition-colors text-center"
                  >
                    <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Click to select files</p>
                    <p className="text-sm text-gray-400">PDF, DOCX, DOC</p>
                  </button>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Selected Files ({selectedFiles.length})
                    </label>
                    {selectedFiles.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="text-[#5BA0A4]" size={20} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(item.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Document Type
                          </label>
                          <select
                            value={item.type}
                            onChange={(e) => handleTypeChange(index, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                          >
                            <option value="">Select type...</option>
                            {documentTypes.length > 0 ? (
                              documentTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>Loading types...</option>
                            )}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

