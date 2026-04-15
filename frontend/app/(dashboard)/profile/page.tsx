'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast, ToastContainer } from '@/components/ui/Toast/Toast';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar/PasswordStrengthBar';
import authService from '@/services/authService';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toasts, show, dismiss } = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!oldPassword) errs.oldPassword = 'Current password is required';
    if (!newPassword || newPassword.length < 8) errs.newPassword = 'New password must be at least 8 characters';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (oldPassword === newPassword) errs.newPassword = 'New password must be different from current password';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);

    try {
      await authService.changePassword(oldPassword, newPassword);
      show('Password changed successfully!', 'success');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.page}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>Manage your account details and password</p>

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

        {/* Change password card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Change Password</h2>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Input
              id="oldPassword"
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => { setOldPassword(e.target.value); setErrors((p) => ({ ...p, oldPassword: '' })); }}
              error={errors.oldPassword}
            />
            <div>
              <Input
                id="newPassword"
                label="New Password"
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })); }}
                error={errors.newPassword}
              />
              <PasswordStrengthBar password={newPassword} />
            </div>
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
              error={errors.confirmPassword}
            />
            <Button type="submit" isLoading={isLoading}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
