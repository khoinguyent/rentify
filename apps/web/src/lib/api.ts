const API_BASE_URL = '/api';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API error: ${response.statusText}`);
  }

  return response.json();
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  rentalPrice?: number;
  status: string;
  type: string;
  furnishing?: string;
  numBedrooms?: number;
  numBathrooms?: number;
  floorArea?: number;
  parkingSpaces?: number;
  availableFrom?: string;
  hasMultipleUnits?: boolean;
  totalUnits?: number;
  amenities?: Array<{ id: string; name?: string; icon?: string; description?: string }>;
  units?: Array<{
    id: string;
    name: string;
    bedrooms: number;
    bathrooms: number;
    rent: number;
    available: boolean;
  }>;
  photos?: string[];
  imageUrl?: string;
  description?: string;
  activeTenant?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  activeLease?: {
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
}

// Get all properties
export async function getProperties(): Promise<Property[]> {
  try {
    const data = await fetchWithAuth(`${API_BASE_URL}/properties`);
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

// Get property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    // Add cache-busting timestamp to ensure fresh data
    const timestamp = new Date().getTime();
    const data = await fetchWithAuth(`${API_BASE_URL}/properties/${id}?_t=${timestamp}`);
    console.log('API getPropertyById response:', {
      id: data?.id,
      amenitiesCount: data?.amenities?.length || 0,
      amenitiesStructure: data?.amenities?.[0]
    });
    return data;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

// Create property
export async function createProperty(propertyData: Partial<Property>): Promise<Property> {
  try {
    const data = await fetchWithAuth(`${API_BASE_URL}/properties`, {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
    return data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
}

// Update property
export async function updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
  try {
    const data = await fetchWithAuth(`${API_BASE_URL}/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(propertyData),
    });
    return data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
}

// Delete property
export async function deleteProperty(id: string): Promise<void> {
  try {
    await fetchWithAuth(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

// Get amenities list
export async function getAmenities(): Promise<Array<{ id: string; name: string; icon?: string }>> {
  try {
    const data = await fetchWithAuth(`${API_BASE_URL}/properties/amenities`);
    return data;
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return [];
  }
}

