'use client';

import Sidebar from '@/components/layout/Sidebar/Sidebar';
import styles from './layout.module.css';

/**
 * Dashboard layout:
 * - Render sidebar + main content area without auth checks.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
