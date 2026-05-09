'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserRoleFromToken, getRoleBasedRedirect } from '@/lib/utils/jwt';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export default function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    // Only redirect if we have a token and are on the base dashboard
    if (!token) return;

    const currentPath = window.location.pathname;
    
    // Only apply role-based redirect if user is on the base dashboard path
    if (currentPath === '/dashboard' || currentPath === '/dashboard/') {
      const userRole = getUserRoleFromToken(token);
      const redirectPath = getRoleBasedRedirect(userRole || 'employee');
      
      // Redirect to the appropriate dashboard
      if (redirectPath !== currentPath) {
        router.replace(redirectPath);
      }
    }
  }, [token, router]);

  return <>{children}</>;
}
