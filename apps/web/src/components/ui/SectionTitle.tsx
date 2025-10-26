import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionTitle({ title, subtitle, icon, className = '' }: SectionTitleProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-[#5BA0A4]">{icon}</div>}
        <h2 className="text-2xl font-semibold text-[#1E293B]">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm uppercase tracking-wider text-[#64748B] font-semibold ml-9">
          {subtitle}
        </p>
      )}
    </div>
  );
}
