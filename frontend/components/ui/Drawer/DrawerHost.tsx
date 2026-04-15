'use client';

import React from 'react';
import { useUI } from '@/context/UIContext';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './Drawer.module.css';

const DrawerHost: React.FC = () => {
  const { isDrawerOpen, drawerContent, closeDrawer } = useUI();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          
          {/* Drawer Container */}
          <motion.div
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.header}>
              <button className={styles.closeBtn} onClick={closeDrawer}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.content}>
              {drawerContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DrawerHost;
