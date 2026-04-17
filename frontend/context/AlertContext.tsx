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
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { activeCollegeId } = useCollege();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastReadAt, setLastReadAt] = useState<number>(0);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await alertService.getAlerts(activeCollegeId || undefined);
      const newAlerts = data.data;
      setAlerts(newAlerts);
      
      // Calculate unread: alerts newer than lastReadAt (or just count all if lastReadAt is 0)
      setUnreadCount(newAlerts.length); // Simplified for now: count is total alerts
    } catch (err) {
      console.error('Alert fetch failed');
    } finally {
      setIsLoading(false);
    }
  }, [activeCollegeId]);

  useEffect(() => {
    fetchAlerts();
    
    // Smart Polling: Every 60 seconds
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const markAsRead = () => {
    setUnreadCount(0);
    setLastReadAt(Date.now());
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        isLoading,
        refreshAlerts: fetchAlerts,
        markAsRead
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
