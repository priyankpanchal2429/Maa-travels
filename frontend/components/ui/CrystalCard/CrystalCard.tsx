import React from 'react';
import styles from './CrystalCard.module.css';

interface CrystalCardProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'magenta' | 'orange' | 'default';
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
  interactive?: boolean;
}

const CrystalCard: React.FC<CrystalCardProps> = ({ 
  children, 
  variant = 'default', 
  className = '', 
  title, 
  subtitle,
  icon,
  pulse = false,
  interactive = false
}) => {
  return (
    <div className={`bento-card ${styles.card} ${styles[variant]} ${pulse ? 'pulse-' + variant : ''} ${interactive ? styles.interactive : ''} ${className}`}>
      <div className={styles.glow} />
      <div className={styles.content}>
        {(title || icon) && (
          <div className={styles.header}>
            <div className={styles.headerText}>
              {title && <h3 className={styles.title}>{title}</h3>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {icon && <div className={styles.icon}>{icon}</div>}
          </div>
        )}
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CrystalCard;
