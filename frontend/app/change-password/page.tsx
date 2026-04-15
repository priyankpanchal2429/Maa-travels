'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar/PasswordStrengthBar';
import { ToastContainer, useToast } from '@/components/ui/Toast/Toast';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';
import authService from '@/services/authService';
import styles from './page.module.css';

/**
 * Force change password page.
 * Shown when user.mustChangePassword === true (after admin password reset).
 * Does NOT require old password — user just logged in with the temp one.
 */
export default function ChangePasswordPage() {
  const { logout, refreshUser } = useAuth();
  const router = useRouter();
  const { toasts, show, dismiss } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);

    try {
      await authService.forceChangePassword(newPassword);
      show('Password updated! Redirecting…', 'success');
      await refreshUser();
      setTimeout(() => router.replace('/'), 1000);
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Failed to update password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.background}>
        <div className={styles.orb1} /><div className={styles.orb2} />
      </div>
      <div className={styles.topBar}><ThemeToggle /></div>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.icon}>🔐</div>
          <h1 className={styles.title}>Set New Password</h1>
          <p className={styles.subtitle}>
            Your password was reset by an administrator.
            Please set a new password to continue.
          </p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div>
              <Input id="newPwd" label="New Password" type="password" placeholder="Min. 8 characters"
                value={newPassword} error={errors.newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })); }}
                autoFocus />
              <PasswordStrengthBar password={newPassword} />
            </div>
            <Input id="confirm" label="Confirm Password" type="password" placeholder="Re-enter new password"
              value={confirm} error={errors.confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }} />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Set Password & Continue
            </Button>
          </form>

          <button className={styles.logoutLink} onClick={logout}>
            Sign out instead
          </button>
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
