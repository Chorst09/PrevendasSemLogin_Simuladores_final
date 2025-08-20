"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { JWTPayload } from '@/lib/auth'; // Reutilizando a interface do backend

interface AuthContextType {
  user: JWTPayload | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para decodificar o token (simplificada, sem verificação de assinatura)
const decodeToken = (token: string): JWTPayload | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload as JWTPayload;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let storedToken = localStorage.getItem('auth-token');
    
    // If no token in localStorage, check cookies
    if (!storedToken) {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      if (authCookie) {
        storedToken = authCookie.split('=')[1];
        // Sync back to localStorage
        localStorage.setItem('auth-token', storedToken);
      }
    }
    
    if (storedToken) {
      const decodedUser = decodeToken(storedToken);
      if (decodedUser) {
        setUser(decodedUser);
        setToken(storedToken);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('auth-token', newToken);
    // Also set as cookie for server-side requests
    document.cookie = `auth-token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    const decodedUser = decodeToken(newToken);
    setToken(newToken);
    setUser(decodedUser);
    router.push('/admin/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    // Also remove cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    setToken(null);
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
