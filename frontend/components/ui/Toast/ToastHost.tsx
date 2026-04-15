'use client';

import React from 'react';
import { useUI } from '@/context/UIContext';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './Toast.module.css';

const icons = {
  success: <CheckCircle className={styles.successIcon} size={20} />,
  error: <AlertCircle className={styles.errorIcon} size={20} />,
  info: <Info className={styles.infoIcon} size={20} />,
  warning: <AlertTriangle className={styles.warningIcon} size={20} />,
};

const ToastHost: React.FC = () => {
  const { toasts, removeToast } = useUI();

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={styles.toast}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
          >
            <div className={styles.icon}>{icons[toast.type]}</div>
            <div className={styles.message}>{toast.message}</div>
            <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastHost;
