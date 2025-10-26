'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle, FileText, FileImage, FileVideo, FileAudio, Archive } from 'lucide-react';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (index: number) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  existingFiles?: Array<{
    id: string;
    url: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    isPrimary?: boolean;
  }>;
  folder?: string;
  disabled?: boolean;
  allowMultiple?: boolean;
  fileType?: 'all' | 'images' | 'documents' | 'videos' | 'audio' | 'archives';
}

const FILE_TYPE_CONFIGS = {
  all: {
    acceptedTypes: ['*/*'],
    description: 'All file types',
    icon: File,
  },
  images: {
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    description: 'Images (JPEG, PNG, WEBP, GIF, SVG)',
    icon: FileImage,
  },
  documents: {
    acceptedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
    ],
    description: 'Documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV)',
    icon: FileText,
  },
  videos: {
    acceptedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    description: 'Videos (MP4, AVI, MOV, WMV, WEBM)',
    icon: FileVideo,
  },
  audio: {
    acceptedTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
    description: 'Audio (MP3, WAV, OGG, M4A, AAC)',
    icon: FileAudio,
  },
  archives: {
    acceptedTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip'],
    description: 'Archives (ZIP, RAR, 7Z, GZ)',
    icon: Archive,
  },
};

export function FileUpload({
  onUpload,
  onRemove,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes,
  existingFiles = [],
  folder = 'general',
  disabled = false,
  allowMultiple = true,
  fileType = 'all',
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use file type config if no specific acceptedTypes provided
  const config = FILE_TYPE_CONFIGS[fileType];
  const finalAcceptedTypes = acceptedTypes || config.acceptedTypes;
  const IconComponent = config.icon;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    setError(null);

    // Validate files
    const validFiles = files.filter((file) => {
      // Check file type
      if (finalAcceptedTypes[0] !== '*/*' && !finalAcceptedTypes.includes(file.type)) {
        setError(`File ${file.name} is not a supported file type`);
        return false;
      }
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is ${maxSize}MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    if (existingFiles.length + validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    try {
      setUploading(true);
      await onUpload(validFiles);
    } catch (err) {
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType.startsWith('audio/')) return FileAudio;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return Archive;
    return File;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-[#5BA0A4] bg-[#5BA0A4]/5'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={finalAcceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            {uploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5BA0A4]"></div>
            ) : (
              <IconComponent className="h-12 w-12" />
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-[#5BA0A4]">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {config.description} up to {maxSize}MB each (max {maxFiles} files)
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Current Files</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.mimeType || '');
              const isImage = file.mimeType?.startsWith('image/');
              
              return (
                <div key={file.id} className="relative group border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {isImage ? (
                        <img
                          src={file.url}
                          alt={file.fileName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <FileIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.fileName}
                      </p>
                      {file.fileSize && (
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.fileSize)}
                        </p>
                      )}
                      {file.isPrimary && (
                        <span className="inline-block bg-[#5BA0A4] text-white text-xs px-2 py-1 rounded mt-1">
                          Primary
                        </span>
                      )}
                    </div>
                    {onRemove && !disabled && (
                      <button
                        onClick={() => onRemove(index)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
