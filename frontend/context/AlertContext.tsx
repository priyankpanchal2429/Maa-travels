'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import alertService from '@/services/alertService';
import { useCollege } from './CollegeContext';

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  date: string;
}

interface AlertContextValue {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  refreshAlerts: () => Promise<void>;
  markAsRead: () => void;
  dismissAlert: (id: string) => void;
  dismissAll: () => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

const DISMISSED_KEY = 'maa-travels-dismissed-alerts';

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { activeCollegeId } = useCollege();
  const [rawAlerts, setRawAlerts] = useState<Alert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastReadAt, setLastReadAt] = useState<number>(0);

  // Initialize dismissed IDs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(DISMISSED_KEY);
    if (saved) {
      try {
        setDismissedIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse dismissed alerts');
      }
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await alertService.getAlerts(activeCollegeId || undefined);
      const newAlerts = data.data;
      setRawAlerts(newAlerts);
    } catch (err) {
      console.error('Alert fetch failed');
    } finally {
      setIsLoading(false);
    }
  }, [activeCollegeId]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Derive active alerts (those not dismissed)
  const alerts = React.useMemo(() => {
    return rawAlerts.filter(a => !dismissedIds.includes(a.id));
  }, [rawAlerts, dismissedIds]);

  // Update unread count whenever alerts change
  useEffect(() => {
    setUnreadCount(alerts.length);
  }, [alerts]);

  const markAsRead = () => {
    setUnreadCount(0);
    setLastReadAt(Date.now());
  };

  const dismissAlert = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
  };

  const dismissAll = () => {
    const allIds = rawAlerts.map(a => a.id);
    const updated = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(updated);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        isLoading,
        refreshAlerts: fetchAlerts,
        markAsRead,
        dismissAlert,
        dismissAll
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
