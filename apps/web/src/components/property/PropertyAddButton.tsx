'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function PropertyAddButton() {
  const router = useRouter();

  const handleClick = () => {
    // TODO: Open add property modal or navigate to form
    router.push('/properties/new');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-[#5BA0A4] text-white px-4 py-2 rounded-md hover:bg-[#4a8e91] transition-colors flex items-center gap-2"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Property
    </button>
  );
}

