'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  PhotoIcon, 
  TrashIcon, 
  StarIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface PropertyImage {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface PropertyImagesTabProps {
  propertyId: string;
  images: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
}

interface TempImage {
  id: string;
  file: File;
  preview: string;
  fileName: string;
  originalName: string;
  url: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface PropertyImagesTabRef {
  uploadTempImages: () => Promise<PropertyImage[]>;
}

const PropertyImagesTab = forwardRef<PropertyImagesTabRef, PropertyImagesTabProps>(({
  propertyId,
  images,
  onImagesChange,
}, ref) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tempImages, setTempImages] = useState<TempImage[]>([]);

  // Expose upload function to parent component
  useImperativeHandle(ref, () => ({
    uploadTempImages,
  }));

  const handleFileUpload = (files: FileList) => {
    if (!files.length) return;

    setError(null);

    try {
      const newTempImages: TempImage[] = Array.from(files).map((file, index) => {
        const preview = URL.createObjectURL(file);
        const fileName = `${Date.now()}_${file.name}`;
        
        return {
          id: `temp_${Date.now()}_${index}`,
          file,
          preview,
          fileName,
          originalName: file.name,
          url: preview, // Use preview URL for display
          altText: file.name,
          isPrimary: images.length === 0 && tempImages.length === 0, // First image is primary
          sortOrder: images.length + tempImages.length + index,
        };
      });

      setTempImages(prev => [...prev, ...newTempImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process images');
    }
  };

  const handleDeleteTempImage = (tempImageId: string) => {
    setTempImages(prev => {
      const imageToRemove = prev.find(img => img.id === tempImageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== tempImageId);
    });
  };

  const uploadTempImages = async (): Promise<PropertyImage[]> => {
    if (tempImages.length === 0) return [];

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      tempImages.forEach(tempImage => {
        formData.append('files', tempImage.file);
      });

      const response = await fetch('/api/storage/upload-multiple', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const uploadedFiles = await response.json();
      
      // Create property image records in batch
      const imageResponse = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(
          uploadedFiles.map((uploadedFile: any, index: number) => ({
            fileName: uploadedFile.fileName,
            originalName: uploadedFile.originalName,
            fileSize: uploadedFile.fileSize,
            mimeType: uploadedFile.mimeType,
            storageKey: uploadedFile.key,
            url: uploadedFile.url,
            altText: uploadedFile.originalName,
            isPrimary: images.length === 0 && index === 0, // First image is primary
            sortOrder: images.length + index,
          }))
        ),
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to create image records');
      }

      const result = await imageResponse.json();
      console.log('Batch image creation result:', result);

      // Clear temp images and revoke object URLs
      tempImages.forEach(tempImage => {
        URL.revokeObjectURL(tempImage.preview);
      });
      setTempImages([]);

      // Return the uploaded files data for the parent component
      return uploadedFiles.map((uploadedFile: any, index: number) => ({
        id: `uploaded_${Date.now()}_${index}`, // Temporary ID for display
        fileName: uploadedFile.fileName,
        originalName: uploadedFile.originalName,
        fileSize: uploadedFile.fileSize,
        mimeType: uploadedFile.mimeType,
        storageKey: uploadedFile.key,
        url: uploadedFile.url,
        altText: uploadedFile.originalName,
        isPrimary: images.length === 0 && index === 0,
        sortOrder: images.length + index,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      onImagesChange(images.filter(img => img.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      // Update all images to set isPrimary to false
      await Promise.all(
        images.map(img => 
          fetch(`/api/properties/${propertyId}/images/${img.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ isPrimary: false }),
          })
        )
      );

      // Set the selected image as primary
      const response = await fetch(`/api/properties/${propertyId}/images/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to set primary image');
      }

      // Update local state
      onImagesChange(
        images.map(img => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set primary image');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length > 0) {
      handleFileUpload(imageFiles as any);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
        <span className="text-sm text-gray-500">
          {images.length + tempImages.length} images
          {tempImages.length > 0 && (
            <span className="text-blue-600 ml-1">({tempImages.length} pending)</span>
          )}
        </span>
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Upload images'}
            </span>
            <span className="mt-1 block text-sm text-gray-500">
              Drag and drop images here, or click to select
            </span>
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            disabled={uploading}
          />
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Choose Files'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Images Grid */}
      {(images.length > 0 || tempImages.length > 0) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Existing Images */}
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.altText || image.originalName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
                
                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <StarIconSolid className="h-3 w-3 mr-1" />
                    Primary
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setPreviewImage(image.url)}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                      title="Preview"
                    >
                      <EyeIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    {!image.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(image.id)}
                        className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                        title="Set as primary"
                      >
                        <StarIcon className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-red-50"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.originalName}
                </p>
                {image.caption && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {image.caption}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Temporary Images */}
          {tempImages.map((tempImage) => (
            <div
              key={tempImage.id}
              className="relative group bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden"
            >
              <div className="aspect-square relative">
                <Image
                  src={tempImage.preview}
                  alt={tempImage.altText || tempImage.originalName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
                
                {/* Pending Badge */}
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Pending
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setPreviewImage(tempImage.preview)}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                      title="Preview"
                    >
                      <EyeIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteTempImage(tempImage.id)}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-red-50"
                      title="Remove"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {tempImage.originalName}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Will be uploaded when saved
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2">No images uploaded yet.</p>
          <p className="text-sm">Upload images to showcase your property.</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <Image
              src={previewImage}
              alt="Preview"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
});

PropertyImagesTab.displayName = 'PropertyImagesTab';

export default PropertyImagesTab;
