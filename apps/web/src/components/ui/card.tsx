import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'light-teal' | 'soft-white';
  padding?: 'sm' | 'md' | 'lg';
  noShadow?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  background = 'white',
  padding = 'md',
  noShadow = false
}: CardProps) {
  const backgroundColors = {
    'white': 'bg-white',
    'light-teal': 'bg-[#E9F5F6]',
    'soft-white': 'bg-[#F8FBFB]',
  };

  const paddingClasses = {
    'sm': 'p-4',
    'md': 'p-6 md:p-8',
    'lg': 'p-8 md:p-10',
  };

  return (
    <div 
      className={`
        ${backgroundColors[background]}
        ${paddingClasses[padding]}
        rounded-2xl
        ${noShadow ? '' : 'shadow-md'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}