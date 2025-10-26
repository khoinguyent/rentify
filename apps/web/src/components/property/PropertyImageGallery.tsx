'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Plus, Maximize2 } from 'lucide-react';

interface PropertyImageGalleryProps {
  images: Array<{
    id: string;
    fileName: string;
    url: string;
    altText?: string;
    isPrimary?: boolean;
  }>;
  alt?: string;
}

export function PropertyImageGallery({ images, alt = 'Property image' }: PropertyImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle keyboard navigation in modal
  useEffect(() => {
    if (selectedImage === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-[#F3FAFA] rounded-2xl flex items-center justify-center shadow-md border border-[#E9F5F6]">
        <div className="text-center">
          <div className="text-[#5BA0A4] text-6xl mb-4 opacity-30">📷</div>
          <span className="text-[#64748B] text-lg font-medium">No images available</span>
        </div>
      </div>
    );
  }

  const displayImages = images.slice(0, 5);
  const remainingCount = images.length - 5;

  const openModal = (index: number) => {
    setSelectedImage(index);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Get layout based on image count
  const getLayout = () => {
    const count = displayImages.length;
    
    switch (count) {
      case 1:
        return { grid: 'grid-cols-1', aspect: 'aspect-[16/9]' };
      case 2:
        return { grid: 'grid-cols-2', aspect: 'aspect-[4/3]' };
      case 3:
        return { grid: 'grid-cols-2', aspect: 'h-full' };
      case 4:
        return { grid: 'grid-cols-2', aspect: 'aspect-square' };
      case 5:
        return { grid: 'grid-cols-3', aspect: 'h-full' };
      default:
        return { grid: 'grid-cols-3', aspect: 'h-full' };
    }
  };

  const { grid, aspect } = getLayout();

  // Get specific image classes based on count and position
  const getImageClasses = (index: number, count: number) => {
    if (count === 1) {
      return 'col-span-1 row-span-1';
    } else if (count === 2) {
      return 'col-span-1 row-span-1';
    } else if (count === 3) {
      // Left: 1 image (50% width, full height); Right: two stacked
      if (index === 0) {
        return 'col-span-1 row-span-2';
      } else {
        return 'col-span-1 row-span-1';
      }
    } else if (count === 4) {
      return 'col-span-1 row-span-1';
    } else if (count === 5) {
      // First column (1/3 width, tall image), other two columns split vertically
      if (index === 0) {
        return 'col-span-1 row-span-2';
      } else {
        return 'col-span-1 row-span-1';
      }
    }
    return 'col-span-1 row-span-1';
  };

  // Mobile carousel layout
  if (isMobile && images.length > 1) {
    return (
      <>
        {/* Mobile Carousel */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
          <div className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {displayImages.map((image, index) => (
              <div
                key={image.id || index}
                className="relative flex-shrink-0 w-full h-full snap-center"
                onClick={() => openModal(index)}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image.url}
                    alt={image.altText || `${alt} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    unoptimized
                  />
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* View All Button for Mobile */}
          {remainingCount > 0 && (
            <button
              onClick={() => openModal(4)}
              className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-md hover:bg-white transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              +{remainingCount} more photos
            </button>
          )}
        </div>

        {/* Mobile Modal */}
        {selectedImage !== null && (
          <div 
            className="fixed inset-0 bg-black z-50 flex items-center animate-in fade-in duration-200"
            onClick={closeModal}
          >
            <div className="relative w-full h-full flex items-center">
              <button
                onClick={(e) => { e.stopPropagation(); closeModal(); }}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full z-50 transition-colors"
              >
                <X size={28} />
              </button>
              
              <div 
                className="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={images[currentIndex].url}
                  alt={images[currentIndex].altText || `${alt} ${currentIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                  unoptimized
                />
              </div>
              
              {/* Navigation for mobile */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full z-50 transition-colors"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full z-50 transition-colors"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
              
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop grid layout with exact proportions
  return (
    <>
      {/* Main Gallery - Proportional Grid */}
      <div className={`grid ${grid} gap-2 h-80 rounded-2xl overflow-hidden`}>
        {displayImages.map((image, index) => {
          const imageClasses = getImageClasses(index, displayImages.length);
          const isLastImage = index === 4;
          
          return (
            <div
              key={image.id || index}
              className={`relative group cursor-pointer overflow-hidden ${imageClasses} animate-in fade-in duration-500`}
              onClick={() => openModal(index)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative w-full h-full min-h-[200px]">
                <Image
                  src={image.url}
                  alt={image.altText || `${alt} ${index + 1}`}
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              
              {/* Hover overlay - dark gradient */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
              
              {/* +N Overlay for 5th image when more photos exist */}
              {isLastImage && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full">
                    <span className="text-white text-xl font-bold">
                      +{remainingCount} photos
                    </span>
                  </div>
                </div>
              )}

              {/* Image info on hover */}
              <div className="absolute top-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                  {index + 1} / {displayImages.length}
                </div>
              </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Lightbox Modal */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-7xl max-h-[95vh] w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-0 right-0 -mt-12 -mr-4 text-white hover:bg-white/20 p-2 rounded-full z-50 transition-colors"
            >
              <X size={28} />
            </button>
            
            {/* Image container */}
            <div className="relative flex-1 flex items-center justify-center bg-black/50 rounded-t-2xl overflow-hidden">
              <Image
                src={images[currentIndex].url}
                alt={images[currentIndex].altText || `${alt} ${currentIndex + 1}`}
                width={1400}
                height={900}
                className="max-w-full max-h-[90vh] object-contain"
                unoptimized
              />
            </div>
            
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-4 rounded-full z-50 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft size={40} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-4 rounded-full z-50 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight size={40} />
                </button>
              </>
            )}
            
            {/* Footer with counter and thumbnails */}
            <div className="bg-white dark:bg-gray-900 rounded-b-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Photo {currentIndex + 1} of {images.length}
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
              
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                        idx === currentIndex 
                          ? 'ring-2 ring-teal-500 scale-110' 
                          : 'hover:scale-105 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || `${alt} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}