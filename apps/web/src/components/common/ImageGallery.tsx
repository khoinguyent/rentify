'use client';

import React from 'react';
import { FileGallery } from './FileGallery';

interface ImageGalleryProps {
  images: Array<{
    id: string;
    url: string;
    fileName: string;
    altText?: string;
    caption?: string;
    isPrimary?: boolean;
  }>;
  onRemove?: (imageId: string) => void;
  onSetPrimary?: (imageId: string) => void;
  editable?: boolean;
  className?: string;
}

export function ImageGallery(props: ImageGalleryProps) {
  // Convert images to files format
  const files = props.images.map(img => ({
    id: img.id,
    url: img.url,
    fileName: img.fileName,
    mimeType: 'image/jpeg', // Default mime type for images
    altText: img.altText,
    caption: img.caption,
    isPrimary: img.isPrimary,
  }));

  return (
    <FileGallery
      {...props}
      files={files}
      layout="grid"
    />
  );
}
