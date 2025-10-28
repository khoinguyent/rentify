import useSWR from 'swr';

// Base API URL - adjust based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  // Get JWT token from session
  const sessionResponse = await fetch('/api/auth/session');
  const session = await sessionResponse.json();
  const token = (session as any)?.nestjsToken;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add JWT token to headers if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

// Tenant dashboard hooks

// Get tenant lease information
export const useTenantLease = (tenantId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    tenantId ? `${API_BASE_URL}/tenants/${tenantId}/lease` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

// Get tenant upcoming payments
export const useTenantUpcomingPayments = (tenantId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    tenantId ? `${API_BASE_URL}/tenants/${tenantId}/upcoming-payments` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

// Get tenant payment history
export const useTenantPaymentHistory = (tenantId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    tenantId ? `${API_BASE_URL}/tenants/${tenantId}/payment-history` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

// Get tenant invoices
export const useTenantInvoices = (tenantId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    tenantId ? `${API_BASE_URL}/tenants/${tenantId}/invoices` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

// Get tenant maintenance requests
export const useTenantMaintenanceRequests = (tenantId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    tenantId ? `${API_BASE_URL}/tenants/${tenantId}/maintenance-requests` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

// Utility hook for refreshing all tenant dashboard data
export const useTenantDashboardRefresh = (tenantId: string) => {
  const leaseMutate = useTenantLease(tenantId).mutate;
  const paymentsMutate = useTenantUpcomingPayments(tenantId).mutate;
  const historyMutate = useTenantPaymentHistory(tenantId).mutate;
  const invoicesMutate = useTenantInvoices(tenantId).mutate;
  const maintenanceMutate = useTenantMaintenanceRequests(tenantId).mutate;

  const refreshAll = () => {
    leaseMutate();
    paymentsMutate();
    historyMutate();
    invoicesMutate();
    maintenanceMutate();
  };

  return {
    refreshAll,
  };
};

