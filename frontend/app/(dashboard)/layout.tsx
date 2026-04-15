'use client';

import TopNav from '@/components/layout/TopNav/TopNav';
import styles from './layout.module.css';

/**
 * Dashboard layout:
 * - Render TopNav + main content area without auth checks.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <TopNav />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
