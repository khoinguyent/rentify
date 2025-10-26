import React from 'react';

interface PropertyStatusBadgeProps {
  status: string;
}

export default function PropertyStatusBadge({ status }: PropertyStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'RENTED':
        return 'bg-gray-100 text-gray-800';
      case 'UNDER_MAINTENANCE':
        return 'bg-orange-100 text-orange-800';
      case 'COMING_SOON':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'RENTED':
        return 'Rented';
      case 'UNDER_MAINTENANCE':
        return 'Maintenance';
      case 'COMING_SOON':
        return 'Coming Soon';
      default:
        return status;
    }
  };

  return (
    <span className={`text-sm px-3 py-1.5 rounded-lg font-medium ${getStatusColor()}`}>
      {getStatusLabel()}
    </span>
  );
}

