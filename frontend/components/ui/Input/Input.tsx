import { forwardRef, useState } from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

/**
 * Reusable Input field with label, error, hint and icon support.
 * Password inputs automatically get a show/hide toggle.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, type = 'text', id, className = '', ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={[styles.wrapper, className].join(' ')}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}

        <div className={[styles.inputWrap, error ? styles.hasError : ''].join(' ')}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

          <input
            ref={ref}
            id={id}
            type={inputType}
            className={[styles.input, leftIcon ? styles.withLeftIcon : ''].join(' ')}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                /* Eye-off icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                /* Eye icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>

        {error && (
          <p id={`${id}-error`} className={styles.error} role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${id}-hint`} className={styles.hint}>{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
