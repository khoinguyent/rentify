'use client';

import React, { useState } from 'react';
import { FileUpload, FileGallery, ImageUpload, ImageGallery } from '@/components/common';
import { uploadFile, uploadMultipleFiles, deleteFile } from '@/lib/images';

interface FileExampleProps {
  propertyId?: string;
}

export function FileExample({ propertyId }: FileExampleProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    url: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    isPrimary?: boolean;
  }>>([]);

  const handleFileUpload = async (files: File[]) => {
    try {
      const uploadResults = await uploadMultipleFiles(files, 'examples');
      
      const newFiles = uploadResults.map((result, index) => ({
        id: `file-${Date.now()}-${index}`,
        url: result.url,
        fileName: files[index].name,
        fileSize: files[index].size,
        mimeType: files[index].type,
        isPrimary: false,
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleFileRemove = async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      try {
        // Extract key from URL or use fileName as key
        const key = file.fileName; // This should be the storage key
        await deleteFile(key);
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleSetPrimary = (fileId: string) => {
    setUploadedFiles(prev => 
      prev.map(f => ({ ...f, isPrimary: f.id === fileId }))
    );
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-800">File Upload Examples</h1>

      {/* All File Types */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">All File Types</h2>
        <FileUpload
          onUpload={handleFileUpload}
          fileType="all"
          maxFiles={20}
          maxSize={50} // 50MB
          folder="all-files"
        />
      </section>

      {/* Images Only */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Images Only</h2>
        <ImageUpload
          onUpload={handleFileUpload}
          maxFiles={10}
          maxSize={5} // 5MB for images
          folder="images"
        />
      </section>

      {/* Documents Only */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Documents Only</h2>
        <FileUpload
          onUpload={handleFileUpload}
          fileType="documents"
          maxFiles={10}
          maxSize={20} // 20MB for documents
          folder="documents"
        />
      </section>

      {/* Videos Only */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Videos Only</h2>
        <FileUpload
          onUpload={handleFileUpload}
          fileType="videos"
          maxFiles={5}
          maxSize={100} // 100MB for videos
          folder="videos"
        />
      </section>

      {/* Audio Only */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Audio Only</h2>
        <FileUpload
          onUpload={handleFileUpload}
          fileType="audio"
          maxFiles={10}
          maxSize={30} // 30MB for audio
          folder="audio"
        />
      </section>

      {/* Archives Only */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Archives Only</h2>
        <FileUpload
          onUpload={handleFileUpload}
          fileType="archives"
          maxFiles={5}
          maxSize={50} // 50MB for archives
          folder="archives"
        />
      </section>

      {/* Custom File Types */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Custom File Types</h2>
        <FileUpload
          onUpload={handleFileUpload}
          acceptedTypes={[
            'application/json',
            'text/csv',
            'application/xml',
            'text/plain',
            'application/zip',
            'application/pdf'
          ]}
          maxFiles={10}
          maxSize={10}
          folder="custom"
        />
      </section>

      {/* File Gallery */}
      {uploadedFiles.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Uploaded Files</h2>
          <FileGallery
            files={uploadedFiles}
            editable={true}
            onRemove={handleFileRemove}
            onSetPrimary={handleSetPrimary}
            layout="grid"
          />
        </section>
      )}

      {/* Usage Examples */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Usage Examples</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Basic File Upload:</h3>
          <pre className="text-sm text-gray-700 overflow-x-auto">
{`<FileUpload
  onUpload={handleUpload}
  fileType="all"
  maxFiles={10}
  maxSize={50}
  folder="uploads"
/>`}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Image Upload (Legacy):</h3>
          <pre className="text-sm text-gray-700 overflow-x-auto">
{`<ImageUpload
  onUpload={handleUpload}
  maxFiles={5}
  maxSize={5}
  folder="images"
/>`}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-medium mb-2">File Gallery:</h3>
          <pre className="text-sm text-gray-700 overflow-x-auto">
{`<FileGallery
  files={files}
  editable={true}
  onRemove={handleRemove}
  onSetPrimary={handleSetPrimary}
  layout="grid" // or "list"
/>`}
          </pre>
        </div>
      </section>
    </div>
  );
}
