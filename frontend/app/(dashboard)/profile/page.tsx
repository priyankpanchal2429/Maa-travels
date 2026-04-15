'use client';

import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Profile</h1>
      <p className={styles.subtitle}>View your account details</p>

      {/* User info card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <p className={styles.name}>{user?.name}</p>
            <p className={styles.meta}>{user?.userId} · <span className={styles.roleBadge}>{user?.role}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
