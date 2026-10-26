'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserRoleFromToken, getRoleBasedRedirect } from '@/lib/utils/jwt';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      // If no token, redirect to login
      router.push('/login');
      return;
    }

    // Get user role from token and redirect accordingly
    const userRole = getUserRoleFromToken(token);
    const redirectPath = getRoleBasedRedirect(userRole || 'employee');
    
    // Defer navigation to avoid router initialization error
    setTimeout(() => {
        router.replace(redirectPath);
    }, 0);
  }, [token, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#4338CA]" />
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
