'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import { ToastContainer, useToast } from '@/components/ui/Toast/Toast';
import styles from './page.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const { toasts, show, dismiss } = useToast();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});
  const [shake, setShake] = useState(false);

  const validate = () => {
    const errs: typeof errors = {};
    if (!userId.trim()) errs.userId = 'User ID is required';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      triggerShake();
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      await login(userId.trim(), password);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'Login failed. Please try again.';
      show(message, 'error');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Animated background */}
      <div className={styles.background}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      {/* Theme toggle — top right */}
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>

      {/* Auth card */}
      <main className={styles.main}>
        <div className={[styles.card, shake ? styles.shake : ''].join(' ')}>

          {/* Logo + heading */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h1 className={styles.appName}>Bus Management</h1>
            <p className={styles.tagline}>Welcome back — sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Input
              id="userId"
              label="User ID"
              placeholder="e.g. Bus001"
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setErrors((p) => ({ ...p, userId: undefined })); }}
              error={errors.userId}
              autoComplete="username"
              autoFocus
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              }
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              error={errors.password}
              autoComplete="current-password"
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <p className={styles.footer}>
            Forgot your password?&nbsp;
            <span className={styles.footerNote}>Contact your administrator.</span>
          </p>
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
