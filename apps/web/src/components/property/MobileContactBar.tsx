import React from 'react';
import { Phone, MessageSquare, Heart, Edit } from 'lucide-react';
import Link from 'next/link';

interface Property {
  id: string;
  rentalPrice?: number;
  status: string;
}

interface MobileContactBarProps {
  property: Property;
  onContact: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function MobileContactBar({ 
  property, 
  onContact, 
  onFavorite, 
  isFavorite = false 
}: MobileContactBarProps) {
  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for price';
    return `$${price.toLocaleString()}/mo`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 md:hidden">
      <div className="flex items-center gap-4">
        {/* Price */}
        <div className="flex-1">
          <div className="text-teal-600 font-bold text-lg">
            {formatPrice(property.rentalPrice)}
          </div>
          <div className="text-sm text-gray-500 capitalize">
            {property.status.toLowerCase()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onFavorite && (
            <button
              onClick={onFavorite}
              className={`p-3 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          
          <Link
            href={`/properties/${property.id}/edit`}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Edit</span>
          </Link>
          
          <button
            onClick={onContact}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageSquare size={16} />
            <span>Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
}
