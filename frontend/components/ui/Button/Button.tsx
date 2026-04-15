import styles from './Button.module.css';
import Spinner from '../Spinner/Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

/**
 * Reusable Button component.
 * Delegates visual variant and size to CSS module classes.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        isLoading ? styles.loading : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLoading ? (
        <Spinner size="sm" color="currentColor" />
      ) : (
        <>
          {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
