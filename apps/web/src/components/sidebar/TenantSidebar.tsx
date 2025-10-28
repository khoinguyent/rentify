'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Home,
  FileText,
  CreditCard,
  Wrench,
  FolderOpen,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';

interface TenantSidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/tenant/dashboard', icon: Home },
  { name: 'My Leases', href: '/tenant/leases', icon: FileText },
  { name: 'Payments', href: '/tenant/payments', icon: CreditCard },
  { name: 'Maintenance', href: '/tenant/maintenance', icon: Wrench },
  { name: 'Documents', href: '/tenant/documents', icon: FolderOpen },
  { name: 'Messages', href: '/tenant/messages', icon: MessageSquare },
];

export function TenantSidebar({ isMobileOpen = false, onMobileToggle }: TenantSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'T';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          flex flex-col h-screen
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onMobileToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-[#5BA0A4] flex items-center justify-center">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Rentify</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onMobileToggle?.()}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${active
                      ? 'bg-[#E9F5F6] text-[#5BA0A4] font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#5BA0A4]'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-[#5BA0A4]' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer - User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-[#E9F5F6] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-[#5BA0A4] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-white">
                  {getInitials(session?.user?.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session?.user?.name || 'Tenant User'}
                </p>
                <p className="text-xs text-gray-600 truncate">Tenant</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/50 hover:text-[#5BA0A4] rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Mobile Toggle Button Component
export function TenantSidebarToggle() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>
      <TenantSidebar
        isMobileOpen={isMobileOpen}
        onMobileToggle={() => setIsMobileOpen(false)}
      />
    </>
  );
}

export default TenantSidebar;

