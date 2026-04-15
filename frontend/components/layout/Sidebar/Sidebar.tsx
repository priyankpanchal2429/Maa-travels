'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Bus as BusIcon, 
  Map as MapIcon, 
  IndianRupee, 
  UserCircle 
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Students',
    href: '/students',
    icon: <Users size={18} />,
  },
  {
    label: 'Drivers',
    href: '/drivers',
    icon: <UserSquare2 size={18} />,
  },
  {
    label: 'Buses',
    href: '/buses',
    icon: <BusIcon size={18} />,
  },
  {
    label: 'Routes',
    href: '/routes',
    icon: <MapIcon size={18} />,
  },
  {
    label: 'Expenses',
    href: '/expenses',
    icon: <IndianRupee size={18} />,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: <UserCircle size={18} />,
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <BusIcon size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className={styles.brandName}>Maa Travels</p>
          <p className={styles.brandSub}>Bus Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
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

      {/* Bottom — user info + theme */}
      <div className={styles.bottom}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.name ?? 'Admin User'}</p>
            <p className={styles.userRole}>System Control</p>
          </div>
        </div>

        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
