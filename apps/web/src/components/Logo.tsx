import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
  showText?: boolean;
  companyName?: string;
}

export function Logo({ 
  href = "/", 
  className = "", 
  showText = true,
  companyName = "Rentify"
}: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-1 ${className}`}>
      <div className="h-8 w-8 rounded-lg flex items-center justify-center">
        {/* Option 1: Use SVG file from public directory */}
        <img 
          src="/logo.svg" 
          alt={`${companyName} Logo`} 
          className="h-6.5 w-6.5 object-contain"
        />
        
        {/* Option 2: Use inline SVG (uncomment to use) */}
        {/* <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg> */}
      </div>
      {showText && (
        <span className="text-xl font-bold text-black">{companyName}</span>
      )}
    </Link>
  );
}
