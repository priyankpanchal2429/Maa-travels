import styles from './page.module.css';

export default function UsersPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>User Management Disabled</h1>
      <p style={{ marginTop: '16px', color: 'var(--color-text-muted)' }}>
        User management functionality has been disabled because the authentication system was removed.
      </p>
    </div>
  );
}
