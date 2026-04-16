'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Bus, Map, ReceiptText, ShieldAlert, Building2, CreditCard 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import adminService, { AdminProfile } from '@/services/adminService';
import CollegeSwitcher from '../CollegeSwitcher/CollegeSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';
import styles from './TopNav.module.css';

const NAV_LINKS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/drivers', label: 'Drivers', icon: ShieldAlert },
  { href: '/buses', label: 'Bus', icon: Bus },
  { href: '/routes', label: 'Routes', icon: Map },
  { href: '/expenses', label: 'Ledger', icon: ReceiptText },
  { href: '/colleges', label: 'Institutions', icon: Building2 },
];

export default function TopNav() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  const loadProfile = async () => {
    try {
      const { data } = await adminService.getProfile();
      setProfile(data.data);
    } catch (err) {
      console.error('Failed to load nav profile');
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('profileUpdated', loadProfile);
    return () => window.removeEventListener('profileUpdated', loadProfile);
  }, []);

  const photoUrl = profile?.profilePhoto 
    ? (profile.profilePhoto.startsWith('http') ? profile.profilePhoto : `${API_URL}${profile.profilePhoto}`)
    : null;

  return (
    <div className={styles.capsuleWrapper}>
      <nav className={styles.capsule}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <span>M</span>
          </div>
          <div className={styles.brandContainer}>
            <span className={styles.brandMaa}>Maa</span>
            <span className={styles.brandTravels}>Travels</span>
          </div>
          <div className={styles.divider} />
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
          <ThemeToggle />
          <Link href="/profile" className={styles.avatar}>
            {photoUrl ? (
              <img src={photoUrl} alt="User" className={styles.avatarImg} />
            ) : (
              <span>AD</span>
            )}
          </Link>
        </div>
      </nav>
    </div>
  );
}
