'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import collegeService, { College } from '@/services/collegeService';

interface CollegeContextValue {
  colleges: College[];
  activeCollegeId: string | null;
  activeCollege: College | null;
  setActiveCollege: (id: string) => void;
  refreshColleges: () => Promise<void>;
  isLoading: boolean;
}

const CollegeContext = createContext<CollegeContextValue | undefined>(undefined);

const STORAGE_KEY = 'maa-travels-active-college';

export const CollegeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [activeCollegeId, setActiveCollegeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const COLLEGES_CACHE_KEY = 'maa-travels-colleges-list';

  const refreshColleges = useCallback(async () => {
    try {
      const { data } = await collegeService.getAll();
      setColleges(data.data);
      localStorage.setItem(COLLEGES_CACHE_KEY, JSON.stringify(data.data));

      // If no active college set, try localStorage or default to first college
      const stored = localStorage.getItem(STORAGE_KEY);
      const valid = data.data.find((c: College) => c._id === stored);
      if (valid) {
        setActiveCollegeId(stored);
      } else if (data.data.length > 0) {
        const firstId = data.data[0]._id;
        setActiveCollegeId(firstId);
        localStorage.setItem(STORAGE_KEY, firstId);
      }
    } catch (err) {
      console.error('Failed to load colleges:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Immediate load from cache
    const cached = localStorage.getItem(COLLEGES_CACHE_KEY);
    const cachedActiveId = localStorage.getItem(STORAGE_KEY);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setColleges(parsed);
        if (cachedActiveId) setActiveCollegeId(cachedActiveId);
        setIsLoading(false); // We have enough to unblock the UI
      } catch (e) {
        console.warn('College cache corrupted');
      }
    }

    refreshColleges();
  }, [refreshColleges]);

  const setActiveCollege = useCallback((id: string) => {
    setActiveCollegeId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const activeCollege = colleges.find(c => c._id === activeCollegeId) || null;

  return (
    <CollegeContext.Provider
      value={{
        colleges,
        activeCollegeId,
        activeCollege,
        setActiveCollege,
        refreshColleges,
        isLoading,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
};
