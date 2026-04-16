'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Bus, Map, ReceiptText, ShieldAlert, Plus, ChevronDown, Bell, User as UserIcon } from 'lucide-react';
import styles from './TopNav.module.css';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/drivers', label: 'Drivers', icon: ShieldAlert },
  { href: '/buses', label: 'Fleet', icon: Bus },
  { href: '/routes', label: 'Routes', icon: Map },
  { href: '/expenses', label: 'Expenses', icon: ReceiptText },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <div className={styles.navWrapper}>
      {/* 1. Top Header */}
      <header className={styles.headerTop}>
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Maa Travels</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.createBtn}>
            <Plus size={14} /> Create <ChevronDown size={14} />
          </button>
          <div className={styles.periodSelect}>
            F.Y. 2026-2027 <ChevronDown size={14} />
          </div>
          <button className={styles.actionIcon}><LayoutDashboard size={14} /></button>
          <button className={styles.actionIcon}><Bell size={14} /></button>
          <div className={styles.avatar}>
            <UserIcon size={14} />
          </div>
        </div>
      </header>

      {/* 2. Tab Bar */}
      <nav className={styles.tabBar}>
        <div className={styles.tabContainer}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
              >
                <Icon size={18} className={styles.tabIcon} />
                <span className={styles.tabLabel}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 3. Pill Strip */}
      <div className={styles.pillStrip}>
        <div className={styles.pillContainer}>
          <button className={`${styles.pill} ${styles.activePill}`}>Analytics</button>
          <button className={styles.pill}>Quick Links</button>
        </div>
      </div>
    </div>
  );
}
