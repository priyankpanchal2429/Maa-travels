'use client';

import {
  createContext,
  useContext,
} from 'react';
import { AuthUser } from '@/types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USER: AuthUser = {
  id: 'mock-id-123',
  userId: 'mock_admin',
  name: 'Admin User',
  role: 'admin',
  mustChangePassword: false,
  isActive: true,
  createdAt: new Date().toISOString()
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = async () => {};
  const logout = async () => {};
  const refreshUser = async () => {};

  return (
    <AuthContext.Provider
      value={{
        user: MOCK_USER,
        isLoading: false,
        isAuthenticated: true,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
