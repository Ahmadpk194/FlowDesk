'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getUserRoleFromToken, getUserNameFromToken, getUserEmailFromToken } from '@/lib/utils/jwt';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { token, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userRole = getUserRoleFromToken(token || '');
  const userEmail = getUserEmailFromToken(token || '');
  const userName = getUserNameFromToken(token || '') || userEmail?.split('@')[0] || 'User';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-[#4338CA] text-white rounded-lg sm:rounded-xl flex items-center justify-center font-semibold text-xs sm:text-sm lg:text-base flex-shrink-0">
          {userName ? userName.charAt(0).toUpperCase() : <User className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-lg font-extrabold text-[#0d1c2e] truncate max-w-[180px] leading-tight">{userName}</p>
          <p className="text-xs font-semibold text-[#64748B] capitalize">{userRole}</p>
        </div>
        <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            {userName && <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>}
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button 
              onClick={() => {
                setIsOpen(false);
                router.push(`/dashboard/${userRole?.toLowerCase()}/profile`);
              }}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors text-left"
            >
              <Settings className="w-4 h-4" />
              My Profile
            </button>
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
