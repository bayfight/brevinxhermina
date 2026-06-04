'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types/models';
import {
  hasInvoiceAccess,
  hasFinanceAccess,
  hasMasterDataAccess,
} from '@/lib/authorization-client';

interface SidebarProps {
  userRole: UserRole | null;
  onClose?: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  allowedRoles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    name: 'History transaksi',
    href: '/dashboard',
    icon: '📊',
    allowedRoles: [
      'super_admin',
      'hermina_account',
      'staff_account',
      'kopi_merchant_account',
      'syrup_merchant_account',
    ],
  },
  {
    name: 'Purchase Orders',
    href: '/po',
    icon: '📦',
    allowedRoles: [
      'super_admin',
      'hermina_account',
      'staff_account',
      'kopi_merchant_account',
      'syrup_merchant_account',
    ],
  },
  {
    name: 'Master Data Item',
    href: '/master-data',
    icon: '🧾',
    allowedRoles: [
      'super_admin',
      'hermina_account',
      'staff_account',
      'kopi_merchant_account',
      'syrup_merchant_account',
    ],
  },
  {
    name: 'Master Data Lokasi',
    href: '/master-data-lokasi',
    icon: '📍',
    allowedRoles: [
      'super_admin',
      'hermina_account',
      'staff_account',
      'kopi_merchant_account',
      'syrup_merchant_account',
    ],
  },
  {
    name: 'Resi',
    href: '/resi',
    icon: '🚚',
    allowedRoles: [
      'super_admin',
      'hermina_account',
      'staff_account',
      'kopi_merchant_account',
      'syrup_merchant_account',
    ],
  },
  {
    name: 'Invoice',
    href: '/invoice',
    icon: '📄',
    allowedRoles: ['super_admin', 'hermina_account'],
  },
  {
    name: 'Finance',
    href: '/finance',
    icon: '💰',
    allowedRoles: ['super_admin', 'kopi_merchant_account', 'syrup_merchant_account'],
  },
];

export function Sidebar({ userRole, onClose }: SidebarProps) {
  const pathname = usePathname();

  const visibleMenuItems = menuItems.filter((item) => {
    if (!userRole) return false;
    
    // Check specific access for Invoice and Finance
    if (item.href === '/invoice') {
      return hasInvoiceAccess(userRole);
    }
    if (item.href === '/finance') {
      return hasFinanceAccess(userRole);
    }
    if (item.href === '/master-data') {
      return hasMasterDataAccess(userRole);
    }
    if (item.href === '/master-data-lokasi') {
      return hasMasterDataAccess(userRole);
    }
    
    // For other items, check if role is in allowed roles
    return item.allowedRoles.includes(userRole);
  });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PO-Resi-Invoice</h1>
          <p className="text-sm text-gray-500 mt-1">History transaksi</p>
        </div>
        
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="px-4 space-y-1">
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
