'use client';

import React, { useState, useRef } from 'react';
import { PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImageUploadDropzoneProps {
  unitId: string;
  unitName: string;
  onUploadComplete: () => void;
}

export default function ImageUploadDropzone({ unitId, unitName, onUploadComplete }: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const filesArray = Array.from(files);
    const remainingSlots = 5 - previewFiles.length;
    const newFiles = filesArray.slice(0, remainingSlots);
    
    setPreviewFiles(prev => [...prev, ...newFiles]);
  };

  const removePreviewFile = (index: number) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (previewFiles.length === 0) return;
    
    setUploading(true);
    try {
      const uploadPromises = previewFiles.map((file) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('objectType', 'Unit');
        fd.append('objectId', unitId);
        fd.append('name', file.name);

        return fetch('/api/storage/upload', {
          method: 'POST',
          body: fd,
          credentials: 'include',
        });
      });

      const responses = await Promise.all(uploadPromises);
      const failed = responses.filter(r => !r.ok);
      
      if (failed.length > 0) {
        console.error('Some uploads failed');
      }
      
      setPreviewFiles([]);
      await onUploadComplete(); // Wait for refresh to complete
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const canAddMore = previewFiles.length < 5;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
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
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleFileInput}
              disabled={uploading}
            />
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#5BA0A4] hover:bg-[#4a8e91] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5BA0A4]"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose Files'}
            </button>
          </div>
        </div>
      )}

      {/* Preview Section - Property-style grid */}
      {previewFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{previewFiles.length} image{previewFiles.length > 1 ? 's' : ''} ready to upload</h3>
            {!uploading && (
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-[#5BA0A4] text-white rounded-md hover:bg-[#4a8e91] text-sm font-medium"
              >
                Upload {previewFiles.length} image{previewFiles.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewFiles.map((file, index) => (
              <div key={index} className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                  {/* Remove button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removePreviewFile(index)}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-red-50"
                      title="Remove"
                    >
                      <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="text-center py-8 text-gray-600">
          <div className="inline-flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5BA0A4]"></div>
            <span>Uploading {previewFiles.length} image{previewFiles.length > 1 ? 's' : ''}...</span>
          </div>
        </div>
      )}

      {/* Empty State when no images are selected */}
      {previewFiles.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2">No images uploaded yet.</p>
          <p className="text-sm">Upload images to showcase your property.</p>
        </div>
      )}
    </div>
  );
}
