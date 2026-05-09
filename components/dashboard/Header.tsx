'use client';

import { Bell, User, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '@/context/auth-context';
import { getUserNameFromToken } from '@/lib/utils/jwt';
import { getAllRequests, getMyRequests } from '@/lib/api/requests.api';
import { Request } from '@/types/request.types';

type HeaderProps = {
  title: string;
  role: string;
  greeting?: string;
  showAddUser?: boolean;
  onMenuClick?: () => void;
  onAddUserClick?: () => void;
};

export default function Header({ 
  title, 
  role, 
  greeting, 
  showAddUser = false,
  onMenuClick,
  onAddUserClick
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { token } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    if (token) {
      const name = getUserNameFromToken(token);
      if (name) {
        setUserName(name);
      }
      
      // Check for new/pending requests to show notification dot
      const checkNotifications = async () => {
        try {
          let requests: any[] = [];
          const roleLower = role.toLowerCase();
          let response: any;
          
          if (roleLower === 'admin' || roleLower === 'manager') {
            response = await getAllRequests();
          } else {
            response = await getMyRequests();
          }

          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            requests = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            requests = response.data;
          } else if (Array.isArray(response)) {
            requests = response;
          }

          if (roleLower === 'admin' || roleLower === 'manager') {
            // Show dot if there are any pending requests
            const pendingCount = requests.filter((r: any) => r.status === 'pending').length;
            setHasNotifications(pendingCount > 0);
          } else {
            // For employees, show dot if any request was updated today (e.g. approved/rejected)
            const today = new Date().toDateString();
            const recentlyUpdated = requests.some((r: any) => 
              r.status !== 'pending' && r.updatedAt && new Date(r.updatedAt).toDateString() === today
            );
            setHasNotifications(recentlyUpdated);
          }
        } catch (error) {
          // Silently fail notification check
        }
      };

      checkNotifications();
      // Check every 30 seconds
      const interval = setInterval(checkNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [token, role]);

  // Generate greeting based on time of day
  const getGreeting = () => {
    if (greeting) return greeting;
    
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header 
      className="h-14 sm:h-16 bg-white border-b border-[#E2E8F0] px-3 sm:px-8 flex items-center justify-between transition-all duration-300"
    >
      {/* Left side - Menu button, Title and Role */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Title */}
        <h1 className="text-base sm:text-xl lg:text-2xl font-semibold text-[#0d1c2e] truncate">
          {title}
        </h1>

        {/* Desktop Role Badge */}
        <div className="hidden sm:flex px-3 py-1 bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-full items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
          <span className="hidden lg:inline">{role}</span>
          <span className="lg:hidden capitalize">{role.charAt(0)}</span>
        </div>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center gap-1 sm:gap-4 lg:gap-6">
        {/* Desktop Greeting */}
        <div className="hidden lg:block text-right">
          <p className="text-base lg:text-lg text-[#0d1c2e] truncate max-w-[250px] leading-tight">
            <span className="font-medium text-gray-500">{getGreeting()},</span>{' '}
            <span className="font-extrabold">{userName}</span>
          </p>
          <p className="text-xs font-semibold text-[#64748B]">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Notifications - Hidden on very small screens */}
        <button 
          onClick={() => router.push(`/dashboard/${role.toLowerCase()}/requests`)}
          className="hidden sm:flex relative p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>

        {/* Profile Dropdown - Always visible but compact on mobile */}
        <div className="flex-shrink-0">
          <ProfileDropdown />
        </div>

        {/* Desktop Add User Button */}
        {showAddUser && (
          <button 
            onClick={onAddUserClick}
            className="hidden lg:flex bg-[#4338CA] hover:bg-[#372abf] text-white px-4 py-2 rounded-xl items-center gap-2 font-medium transition-all text-sm flex-shrink-0"
          >
            <User className="w-4 h-4" />
            Add User
          </button>
        )}

        {/* Tablet Add User Button */}
        {showAddUser && (
          <button 
            onClick={onAddUserClick}
            className="hidden sm:flex lg:hidden bg-[#4338CA] hover:bg-[#372abf] text-white p-2 rounded-lg transition-colors flex-shrink-0"
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}