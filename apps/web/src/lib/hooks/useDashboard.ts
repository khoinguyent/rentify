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
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

// Dashboard summary hook - fetches all dashboard data at once
export const useDashboardSummary = (landlordId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    landlordId ? `${API_BASE_URL}/dashboard/${landlordId}` : null,
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

// Individual dashboard section hooks for lazy loading

// KPI metrics hook
export const useKPIs = (landlordId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    landlordId ? `${API_BASE_URL}/dashboard/${landlordId}/kpi` : null,
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

// Expiring leases hook
export const useExpiringLeases = (landlordId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    landlordId ? `${API_BASE_URL}/dashboard/${landlordId}/expiring-leases` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

// Vacant units hook
export const useVacantUnits = (landlordId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    landlordId ? `${API_BASE_URL}/dashboard/${landlordId}/vacant-units` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

// Maintenance summary hook
export const useMaintenanceSummary = (landlordId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    landlordId ? `${API_BASE_URL}/dashboard/${landlordId}/maintenance` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 120000, // Refresh every 2 minutes
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

// Revenue summary hook
export const useRevenueSummary = (landlordId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    landlordId ? `${API_BASE_URL}/dashboard/${landlordId}/revenue` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

// Recent activity hook
export const useRecentActivity = (landlordId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    landlordId ? `${API_BASE_URL}/dashboard/${landlordId}/activity` : null,
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

// Utility hook for refreshing all dashboard data
export const useDashboardRefresh = (landlordId: string) => {
  const summaryMutate = useDashboardSummary(landlordId).mutate;
  const kpiMutate = useKPIs(landlordId).mutate;
  const leasesMutate = useExpiringLeases(landlordId).mutate;
  const unitsMutate = useVacantUnits(landlordId).mutate;
  const maintenanceMutate = useMaintenanceSummary(landlordId).mutate;
  const revenueMutate = useRevenueSummary(landlordId).mutate;
  const activityMutate = useRecentActivity(landlordId).mutate;

  const refreshAll = () => {
    summaryMutate();
    kpiMutate();
    leasesMutate();
    unitsMutate();
    maintenanceMutate();
    revenueMutate();
    activityMutate();
  };

  return {
    refreshAll,
  };
};
