import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function Spinner({ size = 'md', color }: SpinnerProps) {
  return (
    <span
      className={[styles.spinner, styles[size]].join(' ')}
      style={color ? { borderTopColor: color, borderColor: `${color}30` } : undefined}
      role="status"
      aria-label="Loading"
    />
  );
}
