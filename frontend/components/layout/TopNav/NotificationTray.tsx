'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, X, Clock } from 'lucide-react';
import { useAlerts, Alert } from '@/context/AlertContext';
import styles from './NotificationTray.module.css';

interface NotificationTrayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationTray: React.FC<NotificationTrayProps> = ({ isOpen, onClose }) => {
  const { alerts, markAsRead } = useAlerts();

  React.useEffect(() => {
    if (isOpen) markAsRead();
  }, [isOpen, markAsRead]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className={styles.criticalIcon} size={18} />;
      case 'warning': return <AlertTriangle className={styles.warningIcon} size={18} />;
      default: return <Info className={styles.infoIcon} size={18} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className={styles.tray}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.header}>
              <div>
                <h2>Intelligence Feed</h2>
                <p>{alerts.length} Active Operational Flags</p>
              </div>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              {alerts.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}><Info size={40} /></div>
                  <p>All systems verified operational. No flags detected.</p>
                </div>
              ) : (
                alerts.map((alert: Alert) => (
                  <div key={alert.id} className={`${styles.alertItem} ${styles[alert.type]}`}>
                    <div className={styles.alertHeader}>
                      <div className={styles.category}>
                        {getIcon(alert.type)}
                        <span>{alert.category}</span>
                      </div>
                      <div className={styles.time}>
                         <Clock size={12} />
                         <span>{new Date(alert.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className={styles.message}>{alert.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className={styles.footer}>
              <button className={styles.clearBtn} onClick={onClose}>
                Dismiss All Intelligence
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationTray;
