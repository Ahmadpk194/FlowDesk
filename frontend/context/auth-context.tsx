'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/api/auth.api';
import { isTokenExpired } from '@/lib/utils/jwt';
import { toast } from 'sonner';

type AuthContextType = {
    token: string | null;
    login: (token: string) => void;
    logout: () => Promise<void>;
    checkTokenExpiration: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    // Check token expiration and logout if expired
    const checkTokenExpiration = () => {
        const currentToken = localStorage.getItem('accessToken');
        if (currentToken && isTokenExpired(currentToken)) {
            console.log('Token expired, logging out...');
            handleExpiredToken();
        }
    };

    const handleExpiredToken = async () => {
        // Clear local storage and state immediately
        localStorage.removeItem('accessToken');
        setToken(null);
        
        toast.error('Session expired. Please login again.');
        
        // Redirect to login page
        setTimeout(() => {
            router.push('/login');
        }, 0);
    };

    // restore token on load and check expiration
    useEffect(() => {
        const saved = localStorage.getItem('accessToken');
        if (saved) {
            // Check if token is expired
            if (isTokenExpired(saved)) {
                console.log('Saved token is expired, clearing...');
                localStorage.removeItem('accessToken');
                setToken(null);
                toast.error('Session expired. Please login again.');
            } else {
                setToken(saved);
            }
        }
    }, []);

    // Check token expiration periodically (every minute)
    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            checkTokenExpiration();
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [token]);

    const login = (token: string) => {
        localStorage.setItem('accessToken', token);
        setToken(token);
    };

    const logout = async () => {
        try {
            // Call backend logout API
            await logoutUser();
            toast.success('Logged out successfully');
        } catch (error) {
            // Even if API call fails, we should still logout locally
            console.error('Logout API failed:', error);
            toast.error('Logout failed, but clearing local session');
        } finally {
            // Always clear local storage and state
            localStorage.removeItem('accessToken');
            setToken(null);
            
            // Redirect to home page with setTimeout to avoid router initialization error
            setTimeout(() => {
                router.push('/');
            }, 0);
        }
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, checkTokenExpiration }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}