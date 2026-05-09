"use client";

import { ReactNode, useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Users, PlusCircle, Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AddUserModal from '@/components/dashboard/AddUserModal';
import { getUserRoleFromToken, getRoleBasedRedirect } from '@/lib/utils/jwt';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const role = getUserRoleFromToken(token);
    if (!role || role.toLowerCase() !== 'admin') {
      const redirectPath = role ? getRoleBasedRedirect(role) : '/login';
      router.push(redirectPath);
    } else {
      setIsAuthorized(true);
      setLoading(false);
    }
  }, [router]);

  if (loading || !isAuthorized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 text-[#4338CA] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Verifying access...</p>
      </div>
    );
  }

  const adminNav = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/dashboard/admin",
      active: pathname === "/dashboard/admin",
    },
    {
      label: "All Requests",
      icon: <ClipboardList className="w-5 h-5" />,
      href: "/dashboard/admin/requests",
      active: pathname.startsWith("/dashboard/admin/requests"),
    },
    {
      label: "Users",
      icon: <Users className="w-5 h-5" />,
      href: "/dashboard/admin/users",
      active: pathname.startsWith("/dashboard/admin/users"),
    },
  ];

  const handleNavigation = (href: string) => {
    // Close sidebar on mobile after navigation
    setIsSidebarOpen(false);
    // Navigate to the href
    router.push(href);
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:relative z-50 transition-transform duration-300 lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar role="admin" navItems={adminNav} onNavigate={handleNavigation} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Admin Dashboard" 
          role="Admin" 
          showAddUser={true}
          onMenuClick={handleMenuClick}
          onAddUserClick={() => setIsAddUserModalOpen(true)}
        />
        <AddUserModal 
          isOpen={isAddUserModalOpen} 
          onClose={() => setIsAddUserModalOpen(false)} 
          onSuccess={() => {
            setIsAddUserModalOpen(false);
            router.push('/dashboard/admin/users');
          }}
        />
        
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}