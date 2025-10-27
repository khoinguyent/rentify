'use client';

import React, { useState, useEffect } from 'react';
import { X, User, FileText, DollarSign, Upload, Trash2, Calendar, DollarSign as DollarSignIcon } from 'lucide-react';
import { Property } from '@/lib/api';

// Countries list with flags
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
];

const ID_TYPES = [
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'PASSPORT', label: 'Passport ID' },
  { value: 'VISA', label: 'Visa' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'OTHER', label: 'Other' },
];

interface AddLeaseModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentLease?: {
    id: string;
    startDate: string;
    endDate: string;
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
}

interface TenantInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
}

interface LeaseInfo {
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  billingDay: number;
  billingCycleMonths: number;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  lateFeeAmount: number;
}

interface FixedFee {
  name: string;
  amount: number;
}

interface VariableFee {
  name: string;
  unitPrice: number;
  billingUnit: string;
}

interface DocumentFile {
  file: File;
  preview?: string;
  type?: 'MAIN_CONTRACT' | 'APPENDIX' | 'OTHER';
}

export function AddLeaseModal({ property, isOpen, onClose, onSuccess, currentLease }: AddLeaseModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCurrentTenant, setUseCurrentTenant] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<{[key: number]: string[]}>({});

  // Form data
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    idType: 'NATIONAL_ID',
    idNumber: '',
    phone: '',
    email: '',
  });

  // Handle current tenant toggle
  useEffect(() => {
    if (useCurrentTenant && currentLease?.tenantInfo) {
      setTenantInfo({
        firstName: currentLease.tenantInfo.firstName || '',
        lastName: currentLease.tenantInfo.lastName || '',
        dateOfBirth: currentLease.tenantInfo.dateOfBirth || '',
        gender: currentLease.tenantInfo.gender || '',
        nationality: currentLease.tenantInfo.nationality || '',
        idType: currentLease.tenantInfo.idType || 'NATIONAL_ID',
        idNumber: currentLease.tenantInfo.idNumber || '',
        phone: currentLease.tenantInfo.phone || '',
        email: currentLease.tenantInfo.email || '',
      });
    }
  }, [useCurrentTenant, currentLease]);

  const [leaseInfo, setLeaseInfo] = useState<LeaseInfo>({
    startDate: '',
    endDate: '',
    rentAmount: 0,
    depositAmount: 0,
    billingDay: 1,
    billingCycleMonths: 1,
    discountType: 'PERCENT',
    discountValue: 0,
    lateFeeAmount: 0,
  });

  const [fixedFees, setFixedFees] = useState<FixedFee[]>([
    { name: 'Parking', amount: 0 },
    { name: 'Service Fee', amount: 0 },
  ]);

  const [variableFees, setVariableFees] = useState<VariableFee[]>([
    { name: 'Electricity', unitPrice: 0, billingUnit: 'kWh' },
  ]);

  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  const addFixedFee = () => {
    setFixedFees([...fixedFees, { name: '', amount: 0 }]);
  };

  const removeFixedFee = (index: number) => {
    setFixedFees(fixedFees.filter((_, i) => i !== index));
  };

  const updateFixedFee = (index: number, field: 'name' | 'amount', value: string | number) => {
    const updated = [...fixedFees];
    updated[index] = { ...updated[index], [field]: value };
    setFixedFees(updated);
  };

  const addVariableFee = () => {
    setVariableFees([...variableFees, { name: '', unitPrice: 0, billingUnit: '' }]);
  };

  const removeVariableFee = (index: number) => {
    setVariableFees(variableFees.filter((_, i) => i !== index));
  };

  const updateVariableFee = (index: number, field: 'name' | 'unitPrice' | 'billingUnit', value: string | number) => {
    const updated = [...variableFees];
    updated[index] = { ...updated[index], [field]: value };
    setVariableFees(updated);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs: DocumentFile[] = [];
    
    files.forEach(file => {
      if (file.type === 'application/pdf' || file.type.includes('document') || file.type.includes('word')) {
        // If no main contract exists, first document becomes MAIN_CONTRACT, otherwise defaults to OTHER
        const hasMainContract = documents.some(doc => doc.type === 'MAIN_CONTRACT');
        const newDoc: DocumentFile = {
          file,
          type: documents.length === 0 ? 'MAIN_CONTRACT' : (hasMainContract ? 'OTHER' : 'MAIN_CONTRACT'),
        };
        newDocs.push(newDoc);
      }
    });
    
    if (newDocs.length > 0) {
      setDocuments([...documents, ...newDocs]);
    }
    
    // Reset the input
    e.target.value = '';
  };

  const updateDocumentType = (index: number, type: 'MAIN_CONTRACT' | 'APPENDIX' | 'OTHER') => {
    const updated = [...documents];
    updated[index] = { ...updated[index], type };
    setDocuments(updated);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const errors: string[] = [];
    
    if (!tenantInfo.firstName.trim()) errors.push('First Name is required');
    if (!tenantInfo.lastName.trim()) errors.push('Last Name is required');
    if (!tenantInfo.dateOfBirth) errors.push('Date of Birth is required');
    if (!tenantInfo.nationality) errors.push('Nationality is required');
    if (!tenantInfo.idNumber.trim()) errors.push('ID Number is required');
    if (!tenantInfo.phone.trim()) errors.push('Phone is required');
    if (!tenantInfo.email.trim()) errors.push('Email is required');
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenantInfo.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (errors.length > 0) {
      setStepErrors({ ...stepErrors, [1]: errors });
      return false;
    }
    
    setStepErrors({ ...stepErrors, [1]: [] });
    return true;
  };

  const validateStep2 = (): boolean => {
    const errors: string[] = [];
    
    if (!leaseInfo.startDate) errors.push('Start Date is required');
    if (!leaseInfo.endDate) errors.push('End Date is required');
    if (leaseInfo.rentAmount <= 0) errors.push('Monthly Rent must be greater than 0');
    if (leaseInfo.depositAmount <= 0) errors.push('Deposit Amount must be greater than 0');
    
    // Validate dates
    if (leaseInfo.startDate && leaseInfo.endDate) {
      if (!validateDates(leaseInfo.startDate, leaseInfo.endDate)) {
        errors.push(dateError || 'Invalid date range');
      }
    }
    
    if (errors.length > 0) {
      setStepErrors({ ...stepErrors, [2]: errors });
      return false;
    }
    
    setStepErrors({ ...stepErrors, [2]: [] });
    return true;
  };

  const validateStep3 = (): boolean => {
    const errors: string[] = [];
    
    if (documents.length > 0 && !documents.some(doc => doc.type === 'MAIN_CONTRACT')) {
      errors.push('At least one document must be marked as "Main Contract"');
    }
    
    if (errors.length > 0) {
      setStepErrors({ ...stepErrors, [3]: errors });
      return false;
    }
    
    setStepErrors({ ...stepErrors, [3]: [] });
    return true;
  };

  const validateDates = (startDate: string, endDate: string): boolean => {
    setDateError(null);
    
    if (!startDate || !endDate) {
      return true; // Don't show error if dates are not filled yet
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if start date is before end date
    if (start >= end) {
      setDateError('End date must be after start date');
      return false;
    }

    // Check if there's a current lease and if dates overlap
    if (currentLease) {
      const currentStart = new Date(currentLease.startDate);
      const currentEnd = new Date(currentLease.endDate);

      // Check if new lease starts before current lease ends
      if (start <= currentEnd) {
        const nextDay = new Date(currentEnd);
        nextDay.setDate(nextDay.getDate() + 1);
        setDateError(`New lease must start after ${nextDay.toISOString().split('T')[0]}`);
        return false;
      }
    }

    // Check if dates are in the past
    if (start < today) {
      setDateError('Start date cannot be in the past');
      return false;
    }

    return true;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (field === 'startDate') {
      setLeaseInfo({ ...leaseInfo, startDate: value });
      if (leaseInfo.endDate) {
        validateDates(value, leaseInfo.endDate);
      }
    } else {
      setLeaseInfo({ ...leaseInfo, endDate: value });
      if (leaseInfo.startDate) {
        validateDates(leaseInfo.startDate, value);
      }
    }
  };

  const handleSubmit = async () => {
    // Validate dates before submitting
    if (!validateDates(leaseInfo.startDate, leaseInfo.endDate)) {
      setIsSubmitting(false);
      return;
    }

    // Validate documents
    if (documents.length > 0 && !documents.some(doc => doc.type === 'MAIN_CONTRACT')) {
      alert('At least one Main Contract document is required');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the first available unit for this property
      const response = await fetch(`/api/properties/${property.id}`);
      const propertyData = await response.json();
      
      const unitId = propertyData.units?.[0]?.id;
      if (!unitId) {
        alert('No units available for this property');
        setIsSubmitting(false);
        return;
      }

      // Prepare the request body
      const leaseData = {
        propertyId: property.id,
        unitId: unitId,
        tenantInfo: {
          firstName: tenantInfo.firstName,
          lastName: tenantInfo.lastName,
          email: tenantInfo.email,
          phone: tenantInfo.phone,
          dateOfBirth: tenantInfo.dateOfBirth || undefined,
          gender: tenantInfo.gender || undefined,
          nationality: tenantInfo.nationality,
          idType: tenantInfo.idType,
          idNumber: tenantInfo.idNumber,
        },
        leaseInfo: {
          startDate: leaseInfo.startDate,
          endDate: leaseInfo.endDate,
          rentAmount: leaseInfo.rentAmount,
          depositAmount: leaseInfo.depositAmount,
          billingDay: leaseInfo.billingDay,
          billingCycleMonths: leaseInfo.billingCycleMonths,
          discountType: leaseInfo.discountType,
          discountValue: leaseInfo.discountValue || 0,
          lateFeeAmount: leaseInfo.lateFeeAmount || 0,
        },
        fixedFees: fixedFees.filter(f => f.name && f.amount > 0),
        variableFees: variableFees.filter(f => f.name && f.unitPrice > 0 && f.billingUnit),
      };

      // Create the lease via API
      const createResponse = await fetch('/api/leases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaseData),
        credentials: 'include',
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create lease');
      }

      const result = await createResponse.json();
      console.log('Lease created successfully:', result);

      alert('Lease created successfully!');
      onSuccess?.();
      onClose();
      
      // Reset form
      setCurrentStep(1);
      setTenantInfo({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        idType: 'NATIONAL_ID',
        idNumber: '',
        phone: '',
        email: '',
      });
      setLeaseInfo({
        startDate: '',
        endDate: '',
        rentAmount: 0,
        depositAmount: 0,
        billingDay: 1,
        billingCycleMonths: 1,
        discountType: 'PERCENT',
        discountValue: 0,
        lateFeeAmount: 0,
      });
      setFixedFees([
        { name: 'Parking', amount: 0 },
        { name: 'Service Fee', amount: 0 },
      ]);
      setVariableFees([
        { name: 'Electricity', unitPrice: 0, billingUnit: 'kWh' },
      ]);
      setDocuments([]);
    } catch (error) {
      console.error('Failed to create lease:', error);
      alert('Failed to create lease. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Lease</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[
              { label: 'Tenant Info', icon: User, step: 1 },
              { label: 'Lease Details', icon: FileText, step: 2 },
              { label: 'Documents', icon: Upload, step: 3 },
            ].map(({ label, icon: Icon, step }) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= step ? 'text-[#5BA0A4]' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step
                        ? 'bg-[#5BA0A4] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-[#5BA0A4]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1: Tenant Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tenant Information
                </h3>

                {/* Step 1 Errors */}
                {stepErrors[1] && stepErrors[1].length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-700 mb-2">Please complete the following:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                      {stepErrors[1].map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Use Current Tenant Option */}
                {currentLease && currentLease.tenantInfo && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCurrentTenant}
                        onChange={(e) => setUseCurrentTenant(e.target.checked)}
                        className="w-4 h-4 text-[#5BA0A4] border-gray-300 rounded focus:ring-[#5BA0A4]"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Use Current Tenant</span>
                        <p className="text-sm text-gray-600">
                          Pre-fill tenant information from the current lease ({currentLease.tenantInfo.firstName} {currentLease.tenantInfo.lastName})
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={tenantInfo.firstName}
                      onChange={(e) =>
                        setTenantInfo({ ...tenantInfo, firstName: e.target.value })
                      }
                      disabled={useCurrentTenant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={tenantInfo.lastName}
                      onChange={(e) =>
                        setTenantInfo({ ...tenantInfo, lastName: e.target.value })
                      }
                      disabled={useCurrentTenant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={tenantInfo.dateOfBirth}
                      onChange={(e) =>
                        setTenantInfo({ ...tenantInfo, dateOfBirth: e.target.value })
                      }
                      disabled={useCurrentTenant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={tenantInfo.gender}
                      onChange={(e) =>
                        setTenantInfo({ ...tenantInfo, gender: e.target.value })
                      }
                      disabled={useCurrentTenant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                </div>

                {/* Row with Nationality, ID Type, ID Number */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality *
                    </label>
                    <select
                      value={tenantInfo.nationality}
                      onChange={(e) =>
                        setTenantInfo({ ...tenantInfo, nationality: e.target.value })
                      }
                      disabled={useCurrentTenant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select Nationality</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Type *
                    </label>
                    <select
                      value={tenantInfo.idType}
                      onChange={(e) =>
                        setTenantInfo({ ...tenantInfo, idType: e.target.value })
                      }
                      disabled={useCurrentTenant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      {ID_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      value={tenantInfo.idNumber}
                      onChange={(e) =>
                        setTenantInfo({ ...tenantInfo, idNumber: e.target.value })
                      }
                      disabled={useCurrentTenant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>

                {/* Row with Phone and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={tenantInfo.phone}
                      onChange={(e) =>
                        setTenantInfo({ ...tenantInfo, phone: e.target.value })
                      }
                      disabled={useCurrentTenant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={tenantInfo.email}
                      onChange={(e) =>
                        setTenantInfo({ ...tenantInfo, email: e.target.value })
                      }
                      disabled={useCurrentTenant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Lease Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lease Information
                </h3>

                {/* Step 2 Errors */}
                {stepErrors[2] && stepErrors[2].length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-700 mb-2">Please complete the following:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                      {stepErrors[2].map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={leaseInfo.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      min={currentLease 
                        ? new Date(new Date(currentLease.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0]
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent ${
                        dateError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={leaseInfo.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      min={leaseInfo.startDate || new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent ${
                        dateError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Date Error Message */}
                {dateError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <span>⚠️</span> {dateError}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent *
                  </label>
                  <input
                      type="number"
                      value={leaseInfo.rentAmount || ''}
                      onChange={(e) =>
                        setLeaseInfo({ ...leaseInfo, rentAmount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                      required
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit Amount *
                    </label>
                    <input
                      type="number"
                      value={leaseInfo.depositAmount || ''}
                      onChange={(e) =>
                        setLeaseInfo({ ...leaseInfo, depositAmount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                      required
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={leaseInfo.billingDay}
                    onChange={(e) =>
                      setLeaseInfo({ ...leaseInfo, billingDay: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Cycle (months)
                  </label>
                  <select
                    value={leaseInfo.billingCycleMonths}
                    onChange={(e) =>
                      setLeaseInfo({ ...leaseInfo, billingCycleMonths: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                  >
                    <option value={1}>Monthly</option>
                    <option value={3}>Quarterly</option>
                    <option value={6}>Semi-Annual</option>
                    <option value={12}>Annual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={leaseInfo.discountType}
                    onChange={(e) =>
                      setLeaseInfo({ ...leaseInfo, discountType: e.target.value as 'PERCENT' | 'FIXED' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                  >
                    <option value="PERCENT">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={leaseInfo.discountValue || ''}
                    onChange={(e) =>
                      setLeaseInfo({ ...leaseInfo, discountValue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Late Fee Amount
                  </label>
                  <input
                    type="number"
                    value={leaseInfo.lateFeeAmount || ''}
                    onChange={(e) =>
                      setLeaseInfo({ ...leaseInfo, lateFeeAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Fixed Fees Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">Fixed Fees</h4>
                  <button
                    type="button"
                    onClick={addFixedFee}
                    className="text-sm text-[#5BA0A4] hover:text-[#4a8e91] font-medium"
                  >
                    + Add Fee
                  </button>
                </div>
                <div className="space-y-3">
                  {fixedFees.map((fee, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Fee name (e.g., Parking)"
                        value={fee.name}
                        onChange={(e) => updateFixedFee(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={fee.amount || ''}
                        onChange={(e) => updateFixedFee(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                      />
                      {fixedFees.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFixedFee(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Variable Fees Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">Variable Fees</h4>
                  <button
                    type="button"
                    onClick={addVariableFee}
                    className="text-sm text-[#5BA0A4] hover:text-[#4a8e91] font-medium"
                  >
                    + Add Fee
                  </button>
                </div>
                <div className="space-y-3">
                  {variableFees.map((fee, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Fee name (e.g., Electricity)"
                          value={fee.name}
                          onChange={(e) => updateVariableFee(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Unit (e.g., kWh)"
                          value={fee.billingUnit}
                          onChange={(e) => updateVariableFee(index, 'billingUnit', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="Price per unit"
                          value={fee.unitPrice || ''}
                          onChange={(e) => updateVariableFee(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent"
                        />
                        {variableFees.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariableFee(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lease Documents
                </h3>

                {/* Step 3 Errors */}
                {stepErrors[3] && stepErrors[3].length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-700 mb-2">Please complete the following:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                      {stepErrors[3].map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-4">
                  Upload lease documents in PDF or Word format. <span className="font-semibold">Main Contract is required.</span>
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#5BA0A4] transition-colors">
                  <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="inline-block px-6 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] transition-colors cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Uploaded Documents</h4>
                    <div className="space-y-3">
                      {documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <FileText size={20} className="text-[#5BA0A4] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{doc.file.name}</div>
                            <div className="text-xs text-gray-500">{(doc.file.size / 1024).toFixed(1)} KB</div>
                          </div>
                          <select
                            value={doc.type || 'OTHER'}
                            onChange={(e) => updateDocumentType(index, e.target.value as 'MAIN_CONTRACT' | 'APPENDIX' | 'OTHER')}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent bg-white"
                          >
                            <option value="MAIN_CONTRACT">Main Contract (Required)</option>
                            <option value="APPENDIX">Appendix</option>
                            <option value="OTHER">Other</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Remove document"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {documents.length > 0 && !documents.some(doc => doc.type === 'MAIN_CONTRACT') && (
                      <p className="mt-3 text-sm text-amber-600 flex items-center gap-1">
                        <span>⚠️</span> At least one document must be marked as "Main Contract"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {currentStep < 3 ? (
              <button
                onClick={() => {
                  // Validate current step before proceeding
                  let isValid = false;
                  if (currentStep === 1) {
                    isValid = validateStep1();
                  } else if (currentStep === 2) {
                    isValid = validateStep2();
                  } else if (currentStep === 3) {
                    isValid = validateStep3();
                  }
                  
                  if (isValid) {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                className="px-6 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4a8e91] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Lease'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

