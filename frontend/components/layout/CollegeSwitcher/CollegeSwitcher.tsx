'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Building2, Check } from 'lucide-react';
import { useCollege } from '@/context/CollegeContext';
import { useUI } from '@/context/UIContext';
import CollegeForm from '@/components/colleges/CollegeForm';
import styles from './CollegeSwitcher.module.css';

export default function CollegeSwitcher() {
  const { colleges, activeCollegeId, activeCollege, setActiveCollege, refreshColleges } = useCollege();
  const { openDrawer, closeDrawer, showToast } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setActiveCollege(id);
    setIsOpen(false);
    // Force a page reload to refetch all data with new college context
    window.location.reload();
  };

  const handleAddCollege = () => {
    setIsOpen(false);
    openDrawer(
      <CollegeForm
        onSuccess={() => {
          closeDrawer();
          refreshColleges();
          showToast('College added successfully', 'success');
        }}
      />
    );
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <Building2 size={14} />
        <span className={styles.collegeName}>
          {activeCollege?.name || 'Select College'}
        </span>
        <ChevronDown size={12} className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>Switch College</div>
          <div className={styles.list}>
            {colleges.map((college) => (
              <button
                key={college._id}
                className={`${styles.item} ${college._id === activeCollegeId ? styles.active : ''}`}
                onClick={() => handleSelect(college._id)}
              >
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{college.name}</span>
                  <span className={styles.itemCode}>{college.code}</span>
                </div>
                {college._id === activeCollegeId && <Check size={14} className={styles.checkIcon} />}
              </button>
            ))}
          </div>
          <button className={styles.addBtn} onClick={handleAddCollege}>
            <Plus size={14} /> Add College
          </button>
        </div>
      )}
    </div>
  );
}
