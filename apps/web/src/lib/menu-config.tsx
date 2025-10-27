export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[]; // Array of user roles that can access this menu item
  children?: MenuItem[]; // For nested menus
}

// Menu icon components
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const PropertyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const MaintenanceIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ActivitiesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LeaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// Menu configuration by role
export const menuConfig: Record<string, MenuItem[]> = {
  LANDLORD: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: DashboardIcon,
      roles: ['LANDLORD', 'ADMIN'],
    },
    {
      id: 'properties',
      label: 'Properties',
      href: '/properties',
      icon: PropertyIcon,
      roles: ['LANDLORD', 'ADMIN'],
    },
    {
      id: 'leases',
      label: 'Leases',
      href: '/leases',
      icon: LeaseIcon,
      roles: ['LANDLORD', 'ADMIN'],
    },
    {
      id: 'maintenance',
      label: 'Maintenance Tickets',
      href: '/dashboard/maintenance',
      icon: MaintenanceIcon,
      roles: ['LANDLORD', 'ADMIN'],
    },
    {
      id: 'activities',
      label: 'Activities',
      href: '/dashboard/activities',
      icon: ActivitiesIcon,
      roles: ['LANDLORD', 'ADMIN'],
    },
  ],
  TENANT: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: DashboardIcon,
      roles: ['TENANT'],
    },
    {
      id: 'activities',
      label: 'My Activities',
      href: '/dashboard/activities',
      icon: ActivitiesIcon,
      roles: ['TENANT'],
    },
  ],
  ADMIN: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: DashboardIcon,
      roles: ['ADMIN'],
    },
    {
      id: 'properties',
      label: 'Properties',
      href: '/properties',
      icon: PropertyIcon,
      roles: ['ADMIN'],
    },
    {
      id: 'leases',
      label: 'Leases',
      href: '/leases',
      icon: LeaseIcon,
      roles: ['ADMIN'],
    },
    {
      id: 'maintenance',
      label: 'Maintenance Tickets',
      href: '/dashboard/maintenance',
      icon: MaintenanceIcon,
      roles: ['ADMIN'],
    },
    {
      id: 'activities',
      label: 'Activities',
      href: '/dashboard/activities',
      icon: ActivitiesIcon,
      roles: ['ADMIN'],
    },
  ],
};

// Get menu items for a specific role
export function getMenuItemsForRole(role: string): MenuItem[] {
  return menuConfig[role] || [];
}

