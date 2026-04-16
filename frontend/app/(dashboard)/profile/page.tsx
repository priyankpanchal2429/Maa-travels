'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, LogOut, Settings, Bell, ShieldCheck, Mail } from 'lucide-react';
import adminService, { AdminProfile } from '@/services/adminService';
import CrystalCard from '@/components/ui/CrystalCard/CrystalCard';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await adminService.getProfile();
      setProfile(data.data);
    } catch (err) {
      console.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const { data } = await adminService.updatePhoto(formData);
      setProfile(data.data);
      // Trigger a refresh of the TopNav by just reloading or emitting an event
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignOut = () => {
    // Simulated signout
    localStorage.clear();
    router.push('/');
  };

  if (isLoading) return <div className={styles.loader}><Spinner size="lg" /></div>;

  const photoUrl = profile?.profilePhoto 
    ? (profile.profilePhoto.startsWith('http') ? profile.profilePhoto : `${API_URL}${profile.profilePhoto}`)
    : null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Profile</h1>
        <p className={styles.subtitle}>Manage your identity and system preferences</p>
      </header>

      <div className={styles.grid}>
        {/* Core Identity Card */}
        <CrystalCard variant="cyan" className={styles.identityCard}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarWrapper} onClick={handlePhotoClick}>
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarPlaceholder}>{profile?.name?.charAt(0) || 'A'}</div>
              )}
              <div className={styles.avatarOverlay}>
                {isUploading ? <Spinner size="sm" /> : <Camera size={24} />}
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className={styles.hiddenInput} 
              accept="image/*"
            />
            <div className={styles.identityText}>
              <h2 className={styles.name}>{profile?.name}</h2>
              <p className={styles.role}>{profile?.role}</p>
            </div>
          </div>
        </CrystalCard>

        {/* Settings Grid */}
        <CrystalCard title="Account Security" icon={<ShieldCheck size={18} />} className={styles.securityCard}>
          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <Mail size={16} />
              <span>Verified Email</span>
            </div>
            <div className={styles.statusItem}>
              <Settings size={16} />
              <button className={styles.linkBtn}>Change Password</button>
            </div>
          </div>
        </CrystalCard>

        <CrystalCard title="Preferences" icon={<Bell size={18} />} variant="magenta" className={styles.prefsCard}>
          <div className={styles.toggleList}>
            <div className={styles.toggleItem}>
              <span>Email Notifications</span>
              <div className={styles.switch} />
            </div>
            <div className={styles.toggleItem}>
              <span>System Critical Alerts</span>
              <div className={styles.switchActive} />
            </div>
          </div>
        </CrystalCard>

        <CrystalCard title="Theme & Display" icon={<Settings size={18} />} className={styles.themeCard}>
           <div className={styles.themeOptions}>
             <div className={styles.themeBoxActive}>Dark Mode</div>
             <div className={styles.themeBox}>Light Mode</div>
           </div>
        </CrystalCard>

        {/* Signout Area */}
        <div className={styles.footer}>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            Sign Out from Session <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
