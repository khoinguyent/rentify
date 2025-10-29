import React from 'react';
import { AMENITIES_FALLBACK } from './amenities-fallback';
import { 
  Wifi, 
  Car, 
  Dumbbell, 
  Waves, 
  Snowflake, 
  UtensilsCrossed, 
  Coffee, 
  Tv, 
  Shield, 
  TreePine,
  Sun,
  Moon,
  Home,
  Key,
  Users,
  Camera,
  Music,
  Gamepad2,
  BookOpen,
  Heart,
  Star
} from 'lucide-react';

interface Amenity {
  id: string;
  name?: string;
  icon?: string;
  description?: string;
}

interface PropertyAmenitiesProps {
  amenities: Amenity[];
}

// Icon mapping for common amenities
const getAmenityIcon = (amenityName?: string, iconString?: string) => {
  if (!amenityName) {
    return <Home size={24} className="text-gray-500" />;
  }
  
  const name = amenityName.toLowerCase();
  
  // Use emoji if provided
  if (iconString) {
    return <span className="text-2xl">{iconString}</span>;
  }
  
  // Map common amenity names to Lucide icons
  if (name.includes('wifi') || name.includes('internet')) return <Wifi size={24} className="text-blue-600" />;
  if (name.includes('parking') || name.includes('garage')) return <Car size={24} className="text-gray-600" />;
  if (name.includes('gym') || name.includes('fitness')) return <Dumbbell size={24} className="text-red-600" />;
  if (name.includes('pool') || name.includes('swimming')) return <Waves size={24} className="text-blue-500" />;
  if (name.includes('air conditioning') || name.includes('ac')) return <Snowflake size={24} className="text-blue-400" />;
  if (name.includes('kitchen') || name.includes('cooking')) return <UtensilsCrossed size={24} className="text-orange-600" />;
  if (name.includes('coffee') || name.includes('cafe')) return <Coffee size={24} className="text-amber-600" />;
  if (name.includes('tv') || name.includes('television')) return <Tv size={24} className="text-purple-600" />;
  if (name.includes('security') || name.includes('safe')) return <Shield size={24} className="text-green-600" />;
  if (name.includes('garden') || name.includes('balcony')) return <TreePine size={24} className="text-green-500" />;
  if (name.includes('heating') || name.includes('warm')) return <Sun size={24} className="text-yellow-500" />;
  if (name.includes('night') || name.includes('quiet')) return <Moon size={24} className="text-indigo-600" />;
  if (name.includes('home') || name.includes('house')) return <Home size={24} className="text-gray-600" />;
  if (name.includes('key') || name.includes('access')) return <Key size={24} className="text-gray-600" />;
  if (name.includes('family') || name.includes('kids')) return <Users size={24} className="text-pink-600" />;
  if (name.includes('camera') || name.includes('monitoring')) return <Camera size={24} className="text-gray-600" />;
  if (name.includes('music') || name.includes('sound')) return <Music size={24} className="text-purple-500" />;
  if (name.includes('game') || name.includes('entertainment')) return <Gamepad2 size={24} className="text-green-500" />;
  if (name.includes('book') || name.includes('library')) return <BookOpen size={24} className="text-blue-600" />;
  if (name.includes('pet') || name.includes('animal')) return <Heart size={24} className="text-red-500" />;
  if (name.includes('luxury') || name.includes('premium')) return <Star size={24} className="text-yellow-500" />;
  
  // Default icon
  return <Home size={24} className="text-gray-500" />;
};

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  console.log('PropertyAmenities - received amenities:', amenities);
  
  // Handle both nested and flat structures
  const flatAmenities = (amenities || []).map((amenity: any) => {
    // If it's nested structure: { amenity: { id, name, ... } }
    if (amenity.amenity) {
      return {
        id: amenity.amenity.id,
        name: amenity.amenity.name,
        icon: amenity.amenity.icon,
        description: amenity.amenity.description,
      };
    }
    // If it's just an id string
    if (typeof amenity === 'string') {
      const f = AMENITIES_FALLBACK.find(a => a.id === amenity);
      return f ? { id: f.id, name: f.name, icon: f.icon, description: f.description } : { id: amenity, name: amenity };
    }
    // If it's an object with only id
    if (amenity && !amenity.name && amenity.id) {
      const f = AMENITIES_FALLBACK.find(a => a.id === amenity.id) || AMENITIES_FALLBACK.find(a => a.name === amenity.id);
      return f ? { id: amenity.id, name: f.name, icon: f.icon, description: f.description } : amenity;
    }
    // If it's flat structure: { id, name, ... }
    return amenity;
  }) || [];

  console.log('PropertyAmenities - flattened amenities:', flatAmenities);

  if (!flatAmenities || flatAmenities.length === 0) {
    return (
      <div className="bg-[#F3FAFA] rounded-2xl shadow-md p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-[#1E293B] mb-6">
          <span className="text-sm uppercase tracking-wider text-[#64748B] font-semibold">Amenities</span>
        </h2>
        <div className="text-center py-12">
          <Home size={48} className="text-[#5BA0A4] mx-auto mb-4 opacity-50" />
          <p className="text-[#64748B]">No amenities listed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F3FAFA] rounded-2xl shadow-md p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-[#1E293B] mb-6">
        <span className="text-sm uppercase tracking-wider text-[#64748B] font-semibold">Amenities</span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {flatAmenities
          .filter(amenity => amenity && amenity.name)
          .map((amenity, index) => (
            <div
              key={amenity.id}
              className="flex items-center gap-3 p-4 bg-white rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 border border-[#E9F5F6]"
            >
              <div className="flex-shrink-0 bg-[#E9F5F6] p-2 rounded-lg">
                {getAmenityIcon(amenity.name, amenity.icon)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[#1E293B] truncate">
                  {amenity.name}
                </h3>
                {amenity.description && (
                  <p className="text-sm text-[#64748B] truncate">
                    {amenity.description}
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}