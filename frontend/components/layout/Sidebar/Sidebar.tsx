'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: JSX.Element;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: 'User Management',
    href: '/admin/users',
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="1" y="3" width="15" height="13" rx="2"/>
            <path d="M16 8h4l3 3v5h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
        <div>
          <p className={styles.brandName}>Bus Management</p>
          <p className={styles.brandSub}>System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[styles.navItem, isActive ? styles.active : ''].join(' ')}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {isActive && <span className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user info + theme + logout */}
      <div className={styles.bottom}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userRole}>{user?.userId} · {user?.role}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <ThemeToggle />
          <button className={styles.logoutBtn} onClick={logout} title="Sign out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
