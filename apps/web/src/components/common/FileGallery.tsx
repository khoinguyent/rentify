'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Eye, File, FileText, FileImage, FileVideo, FileAudio, Archive } from 'lucide-react';

interface FileGalleryProps {
  files: Array<{
    id: string;
    url: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    altText?: string;
    caption?: string;
    isPrimary?: boolean;
  }>;
  onRemove?: (fileId: string) => void;
  onSetPrimary?: (fileId: string) => void;
  editable?: boolean;
  className?: string;
  layout?: 'grid' | 'list';
}

export function FileGallery({
  files,
  onRemove,
  onSetPrimary,
  editable = false,
  className = '',
  layout = 'grid',
}: FileGalleryProps) {
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index: number) => {
    setSelectedFile(index);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedFile(null);
  };

  const nextFile = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
  };

  const prevFile = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevFile();
    if (e.key === 'ArrowRight') nextFile();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return FileImage;
    if (mimeType?.startsWith('video/')) return FileVideo;
    if (mimeType?.startsWith('audio/')) return FileAudio;
    if (mimeType?.includes('pdf') || mimeType?.includes('document') || mimeType?.includes('text')) return FileText;
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('7z')) return Archive;
    return File;
  };

  const isImage = (mimeType: string) => mimeType?.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType?.startsWith('video/');
  const isAudio = (mimeType: string) => mimeType?.startsWith('audio/');

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
          <File className="h-12 w-12" />
        </div>
        <p>No files available</p>
      </div>
    );
  }

  const renderFileItem = (file: typeof files[0], index: number) => {
    const FileIcon = getFileIcon(file.mimeType || '');
    const isImageFile = isImage(file.mimeType || '');
    
    return (
      <div key={file.id} className="relative group">
        <div
          className={`cursor-pointer hover:opacity-90 transition-opacity ${
            layout === 'grid' ? 'w-full h-32' : 'w-full h-16'
          }`}
          onClick={() => openModal(index)}
        >
          {isImageFile ? (
            <img
              src={file.url}
              alt={file.altText || file.fileName}
              className={`w-full ${layout === 'grid' ? 'h-32' : 'h-16'} object-cover rounded-lg`}
            />
          ) : (
            <div className={`w-full ${layout === 'grid' ? 'h-32' : 'h-16'} bg-gray-100 rounded-lg flex items-center justify-center`}>
              <FileIcon className={`${layout === 'grid' ? 'h-12 w-12' : 'h-8 w-8'} text-gray-500`} />
            </div>
          )}
        </div>
        
        {/* Primary Badge */}
        {file.isPrimary && (
          <div className="absolute top-2 left-2 bg-[#5BA0A4] text-white text-xs px-2 py-1 rounded">
            Primary
          </div>
        )}

        {/* Action Buttons */}
        {editable && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onSetPrimary && !file.isPrimary && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetPrimary(file.id);
                }}
                className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600"
                title="Set as primary"
              >
                <Eye className="h-3 w-3" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(file.id);
                }}
                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                title="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* File Info */}
        {layout === 'list' && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
            {file.fileSize && (
              <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
            )}
          </div>
        )}

        {/* Caption */}
        {file.caption && layout === 'grid' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
            {file.caption}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* File List/Grid */}
      <div className={`${layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' : 'space-y-3'} ${className}`}>
        {files.map(renderFileItem)}
      </div>

      {/* Modal */}
      {selectedFile !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {files.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevFile();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextFile();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div className="max-w-full max-h-full flex items-center justify-center">
              {isImage(files[currentIndex].mimeType || '') ? (
                <img
                  src={files[currentIndex].url}
                  alt={files[currentIndex].altText || files[currentIndex].fileName}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : isVideo(files[currentIndex].mimeType || '') ? (
                <video
                  src={files[currentIndex].url}
                  controls
                  className="max-w-full max-h-full"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : isAudio(files[currentIndex].mimeType || '') ? (
                <div className="bg-white rounded-lg p-8 max-w-md">
                  <div className="text-center mb-4">
                    <FileAudio className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">{files[currentIndex].fileName}</p>
                  </div>
                  <audio
                    src={files[currentIndex].url}
                    controls
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 max-w-md text-center">
                  <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-4">{files[currentIndex].fileName}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(files[currentIndex].url, '_blank');
                    }}
                    className="bg-[#5BA0A4] text-white px-4 py-2 rounded hover:bg-[#4a8e91]"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{files[currentIndex].fileName}</p>
                  {files[currentIndex].fileSize && (
                    <p className="text-sm text-gray-300">{formatFileSize(files[currentIndex].fileSize)}</p>
                  )}
                  {files[currentIndex].caption && (
                    <p className="text-sm text-gray-300">{files[currentIndex].caption}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className="text-sm text-gray-300">
                    {currentIndex + 1} of {files.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(files[currentIndex].url, '_blank');
                    }}
                    className="text-white hover:text-gray-300"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
