'use client';

import { Layers, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
};

type SidebarProps = {
  role: 'employee' | 'manager' | 'admin';
  navItems: NavItem[];
  onNavigate?: (href: string) => void;
};

export default function Sidebar({ role, navItems, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  // Restore collapse state from localStorage on mount (desktop only)
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved && window.innerWidth >= 1024) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  // Check if a navigation item is active based on current pathname
  const isActive = (item: NavItem) => {
    if (item.active !== undefined) return item.active;
    
    const { href } = item;
    if (href === '/dashboard/employee' && pathname === '/dashboard/employee') return true;
    if (href === '/dashboard/employee/requests' && pathname.startsWith('/dashboard/employee/requests')) return true;
    if (href === '/dashboard/manager' && pathname === '/dashboard/manager') return true;
    if (href === '/dashboard/manager/requests' && pathname.startsWith('/dashboard/manager/requests')) return true;
    if (href === '/dashboard/admin' && pathname === '/dashboard/admin') return true;
    if (href === '/dashboard/admin/requests' && pathname.startsWith('/dashboard/admin/requests')) return true;
    if (href === '/dashboard/admin/users' && pathname.startsWith('/dashboard/admin/users')) return true;
    return false;
  };

  return (
    <aside 
      className={`h-screen bg-white border-r border-[#E2E8F0] flex flex-col transition-all duration-300 shadow-sm z-50
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header with Logo and Toggle */}
      <div className={`p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center ${isCollapsed ? 'flex-col gap-4' : 'justify-between'}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-[#4338CA] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="font-bold text-xl sm:text-2xl text-[#2a14b4] tracking-tight hidden sm:block">
              FlowDesk
            </div>
          )}
        </Link>

        {/* Desktop Toggle / Mobile Close */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
          
          {/* Mobile close button */}
          <button
            onClick={() => onNavigate && onNavigate('')}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      
      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-3 py-4 sm:py-6 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <button
            key={i}
            onClick={() => onNavigate ? onNavigate(item.href) : (window.location.href = item.href)}
            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl font-medium transition-all text-left
              ${isActive(item) ? 'bg-[#E0E7FF] text-[#4338CA]' : 'text-gray-600 hover:bg-gray-100'}
              ${isCollapsed ? 'justify-center' : ''}`}
          >
            {item.icon}
            {!isCollapsed && (
              <span className="hidden sm:inline text-sm sm:text-base">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-[#E2E8F0]">
        <div className={`text-xs text-gray-500 text-center ${isCollapsed ? 'hidden' : 'block'}`}>
          <p>Created by</p>
          <p className="font-medium text-gray-700">Ahmad Khan</p>
        </div>
        {isCollapsed && (
          <div className="text-center">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xs text-gray-600 font-bold">AK</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}