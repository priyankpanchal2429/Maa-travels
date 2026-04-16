'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Bus, Map, ReceiptText, ShieldAlert } from 'lucide-react';
import CollegeSwitcher from '../CollegeSwitcher/CollegeSwitcher';
import styles from './TopNav.module.css';

const NAV_LINKS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/drivers', label: 'Drivers', icon: ShieldAlert },
  { href: '/buses', label: 'Fleet', icon: Bus },
  { href: '/routes', label: 'Routes', icon: Map },
  { href: '/expenses', label: 'Ledger', icon: ReceiptText },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <div className={styles.capsuleWrapper}>
      <nav className={styles.capsule}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <span>M</span>
          </div>
          <span className={styles.brandName}>Maa Travels</span>
          <CollegeSwitcher />
        </div>

        <div className={styles.center}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={16} className={styles.icon} />
                <span className={styles.label}>{link.label}</span>
                {isActive && <div className={styles.activePill} />}
              </Link>
            );
          })}
        </div>

        <div className={styles.right}>
          <div className={styles.avatar}>
            AD
          </div>
        </div>
      </nav>
    </div>
  );
}
