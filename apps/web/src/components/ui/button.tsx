import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const variants = {
    'primary': 'bg-[#1E90FF] text-white hover:bg-[#1a80e6]',
    'secondary': 'bg-[#5BA0A4] text-white hover:bg-[#4a8e91]',
    'outline': 'border-2 border-[#5BA0A4] text-[#5BA0A4] hover:bg-[#5BA0A4] hover:text-white',
    'ghost': 'bg-transparent hover:bg-gray-100',
  };

  const sizes = {
    'sm': 'px-4 py-2 text-sm',
    'md': 'px-5 py-2.5 text-sm',
    'lg': 'px-6 py-3 text-base',
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}