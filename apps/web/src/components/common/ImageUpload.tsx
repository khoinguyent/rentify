'use client';

import React from 'react';
import { FileUpload } from './FileUpload';

interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (index: number) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  existingImages?: Array<{
    id: string;
    url: string;
    fileName: string;
    isPrimary?: boolean;
  }>;
  folder?: string;
  disabled?: boolean;
}

export function ImageUpload(props: ImageUploadProps) {
  // Convert existingImages to existingFiles format
  const existingFiles = props.existingImages?.map(img => ({
    id: img.id,
    url: img.url,
    fileName: img.fileName,
    mimeType: 'image/jpeg', // Default mime type for images
    isPrimary: img.isPrimary,
  }));

  return (
    <FileUpload
      {...props}
      fileType="images"
      existingFiles={existingFiles}
      maxSize={props.maxSize || 5} // Default 5MB for images
      acceptedTypes={props.acceptedTypes || ['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
    />
  );
}
