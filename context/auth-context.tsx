'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    // restore token on load
    useEffect(() => {
        const saved = localStorage.getItem('accessToken');
        if (saved) setToken(saved);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('accessToken', token);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}