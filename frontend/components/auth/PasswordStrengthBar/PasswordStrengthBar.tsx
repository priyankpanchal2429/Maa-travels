import styles from './PasswordStrengthBar.module.css';

interface PasswordStrengthBarProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'var(--color-error)' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'var(--color-warning)' };
  if (score <= 3) return { score: 3, label: 'Good', color: '#2563EB' };
  return { score: 4, label: 'Strong', color: 'var(--color-success)' };
}

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { score, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.bars}>
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={styles.bar}
            style={{ background: score >= level ? color : undefined }}
          />
        ))}
      </div>
      <span className={styles.label} style={{ color }}>
        {label}
      </span>
    </div>
  );
}
