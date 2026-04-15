'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner/Spinner';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import styles from './layout.module.css';

/**
 * Dashboard layout:
 * - Redirects unauthenticated users to /login
 * - Redirects users with mustChangePassword to /change-password
 * - Renders sidebar + main content area
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (user?.mustChangePassword) { router.replace('/change-password'); }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <Spinner size="lg" />
        <p className={styles.loadingText}>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
