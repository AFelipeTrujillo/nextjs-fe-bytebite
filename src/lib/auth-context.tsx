'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from './api';
import { STORAGE_KEYS, ROUTES } from './constants';
import type { RegisterRequest } from './types';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  full_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

// ──────────────────────────────────────────────
// JWT Decoder (no library needed)
// ──────────────────────────────────────────────

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractUserFromToken(token: string): User | null {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  const sub = decoded.sub as string | undefined;
  const email = decoded.email as string | undefined;
  const role = decoded.role as string | undefined;
  const full_name = decoded.full_name as string | undefined;

  if (!sub || !email || !role) return null;
  if (role !== 'admin' && role !== 'user') return null;

  return {
    id: sub,
    email,
    role,
    ...(full_name ? { full_name } : {}),
  };
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

const AuthContext = createContext<AuthState | undefined>(undefined);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, check localStorage for existing token
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (storedToken) {
      const extractedUser = extractUserFromToken(storedToken);
      if (extractedUser) {
        setToken(storedToken);
        setUser(extractedUser);
      } else {
        // Invalid token — clear it
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);
      const { access_token } = response;

      if (!access_token) {
        throw new Error('No access token received');
      }

      const extractedUser = extractUserFromToken(access_token);
      if (!extractedUser) {
        throw new Error('Invalid token received');
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
      setToken(access_token);
      setUser(extractedUser);
      router.push(ROUTES.DASHBOARD);
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      await authApi.register(data);
      // After registration, redirect to login
      router.push(ROUTES.HOME);
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setToken(null);
    setUser(null);
    router.push(ROUTES.HOME);
  }, [router]);

  const value: AuthState = {
    user,
    token,
    isAdmin: user?.role === 'admin',
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

