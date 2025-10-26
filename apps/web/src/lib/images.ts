import { PropertyImage } from './api';

export interface FileUploadResponse {
  url: string;
  key: string;
}

export interface PropertyImageData {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  url: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

// Generic file upload functions
export async function uploadFile(file: File, folder: string = 'general'): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to upload file');
  }

  return response.json();
}

export async function uploadMultipleFiles(files: File[], folder: string = 'general'): Promise<FileUploadResponse[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  const response = await fetch('/api/storage/upload-multiple', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to upload files');
  }

  return response.json();
}

export async function deleteFile(key: string): Promise<void> {
  const response = await fetch(`/api/storage/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to delete file');
  }
}

export async function getFileUrl(key: string): Promise<string> {
  const response = await fetch(`/api/storage/url/${encodeURIComponent(key)}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to get file URL');
  }

  const data = await response.json();
  return data.url;
}

// Image-specific functions (for backward compatibility)
export async function uploadImage(file: File, folder: string = 'properties'): Promise<FileUploadResponse> {
  return uploadFile(file, folder);
}

export async function uploadImages(files: File[], folder: string = 'properties'): Promise<FileUploadResponse[]> {
  return uploadMultipleFiles(files, folder);
}

// Property image management
export async function getPropertyImages(propertyId: string): Promise<PropertyImageData[]> {
  const response = await fetch(`/api/properties/${propertyId}/images`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to fetch property images');
  }

  return response.json();
}

export async function addPropertyImage(
  propertyId: string,
  imageData: {
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    storageKey: string;
    url: string;
    altText?: string;
    caption?: string;
    isPrimary?: boolean;
  }
): Promise<PropertyImageData> {
  const response = await fetch(`/api/properties/${propertyId}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(imageData),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to add property image');
  }

  return response.json();
}

export async function updatePropertyImage(
  propertyId: string,
  imageId: string,
  updates: {
    altText?: string;
    caption?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }
): Promise<PropertyImageData> {
  const response = await fetch(`/api/properties/${propertyId}/images/${imageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to update property image');
  }

  return response.json();
}

export async function deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
  const response = await fetch(`/api/properties/${propertyId}/images/${imageId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to delete property image');
  }
}
