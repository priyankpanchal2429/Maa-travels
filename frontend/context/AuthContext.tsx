'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/types/auth.types';
import { tokenStore } from '@/lib/tokenStore';
import authService from '@/services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const initializedRef = useRef(false);

  /** Attempt silent token refresh on mount (restores session after hard refresh) */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      try {
        const { data } = await authService.refresh();
        tokenStore.set(data.data.accessToken);
        setUser(data.data.user);
      } catch {
        // No valid session — user stays logged out
        tokenStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  /** Listen for force-logout events emitted by Axios interceptor */
  useEffect(() => {
    const handleForceLogout = () => {
      tokenStore.clear();
      setUser(null);
      router.replace('/login');
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [router]);

  const login = useCallback(
    async (userId: string, password: string) => {
      const { data } = await authService.login({ userId, password });
      tokenStore.set(data.data.accessToken);
      setUser(data.data.user);

      if (data.data.user.mustChangePassword) {
        router.replace('/change-password');
      } else {
        router.replace('/');
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Swallow logout errors — clear state regardless
    } finally {
      tokenStore.clear();
      setUser(null);
      router.replace('/login');
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    const { data } = await authService.getMe();
    setUser(data.data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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
