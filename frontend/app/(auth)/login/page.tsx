'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import { ToastContainer, useToast } from '@/components/ui/Toast/Toast';
import { AxiosError } from 'axios';
import styles from './page.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const { toasts, show, dismiss } = useToast();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});
  const [shake, setShake] = useState(false);

  // Focus lock implementation for optimal UX
  useEffect(() => {
    const input = document.getElementById('userId');
    if (input) input.focus();
  }, []);

  const validateForm = () => {
    const errs: typeof errors = {};
    const sanitizedUserId = userId.trim();
    
    if (!sanitizedUserId) {
      errs.userId = 'User ID is required';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    return errs;
  };

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      triggerShake();
      return;
    }
    
    setErrors({});
    setIsLoading(true);

    try {
      await login(userId.trim(), password);
      // On success, AuthContext will perform the redirect. We don't need to do anything here.
    } catch (err: unknown) {
      triggerShake();
      
      // Robust error interception
      if (err instanceof AxiosError && err.code === 'ERR_NETWORK') {
        show('Network error: Unable to reach the server. Please check your connection.', 'error');
      } else if (err instanceof AxiosError && err.response) {
        // Backend actively rejected the login
        const message = err.response.data?.message || 'Invalid credentials. Please try again.';
        show(message, 'error');
        setErrors({ userId: ' ', password: ' ' }); // Highlight fields as errored
      } else {
        // Generic catch-all
        show('An unexpected error occurred during login. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Dynamic Animated background mesh */}
      <div className={styles.background}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      {/* Top right controls */}
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>

      <main className={styles.main}>
        <div className={`${styles.card} ${shake ? styles.shake : ''}`}>
          
          {/* Header & Logo */}
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoGlow} />
              <div className={styles.logo}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
                  <path d="M6 8h12"/>
                  <path d="M6 12h12"/>
                  <circle cx="8" cy="18" r="2"/>
                  <circle cx="16" cy="18" r="2"/>
                </svg>
              </div>
            </div>
            <h1 className={styles.appName}>Maa Travels</h1>
            <p className={styles.tagline}>Secure Gateway Access</p>
          </div>

          {/* Form Engine */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Input
              id="userId"
              label="User ID"
              placeholder="e.g. Bus001"
              value={userId}
              onChange={(e) => { 
                setUserId(e.target.value); 
                if (errors.userId) setErrors((p) => ({ ...p, userId: undefined })); 
              }}
              error={errors.userId}
              autoComplete="username"
              disabled={isLoading}
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter secure password"
              value={password}
              onChange={(e) => { 
                setPassword(e.target.value); 
                if (errors.password) setErrors((p) => ({ ...p, password: undefined })); 
              }}
              error={errors.password}
              autoComplete="current-password"
              disabled={isLoading}
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />

            <div className={styles.submitWrap}>
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Security & Auxiliary */}
          <div className={styles.secureBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            End-to-End Encrypted Link
          </div>

          <p className={styles.footer}>
            Forgot access? <span className={styles.footerNote} onClick={() => show('Contact your system administrator to reset credentials.', 'info')}>Contact Admin</span>
          </p>
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
