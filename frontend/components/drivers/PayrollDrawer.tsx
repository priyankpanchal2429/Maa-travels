'use client';

import React, { useState } from 'react';
import { IndianRupee, FileText, Send, UserSquare2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { Driver } from '@/services/driverService';
import expenseService from '@/services/expenseService';
import styles from './PayrollDrawer.module.css';

interface PayrollDrawerProps {
  driver: Driver;
  onSuccess?: () => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollDrawer({ driver, onSuccess }: PayrollDrawerProps) {
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [allowances, setAllowances] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [recordExpense, setRecordExpense] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { showToast } = useUI();

  const baseSalary = driver.salary || 0;
  const netPay = baseSalary + allowances - deductions;

  const handleSendWhatsApp = async () => {
    setIsSubmitting(true);
    
    try {
      if (recordExpense) {
        await expenseService.create({
          type: 'salary',
          amount: netPay,
          description: `Payroll for ${driver.name} - ${month} ${year}`,
        });
        showToast('Payroll recorded in Expenses', 'success');
      }

      // Format the WhatsApp message exactly as requested
      const msg = `*MAA TRAVELS - PAYSLIP*
Driver: ${driver.name}
Month: ${month} ${year}

Base Salary: ₹${baseSalary.toLocaleString()}
Allowances: ₹${allowances.toLocaleString()}
Deductions: ₹${deductions.toLocaleString()}
*NET PAY: ₹${netPay.toLocaleString()}*

_Generated securely via Maa Travels Console._`;

      const encodedMsg = encodeURIComponent(msg);
      
      // Attempt to clean the phone number format
      let cleanPhone = driver.phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone; // Fallback to INDIA code if 10 digits

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
      window.open(waUrl, '_blank');
      
      if (onSuccess) onSuccess();

    } catch (error) {
      showToast('Error recording payroll expense. Message not sent.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.iconBox}>
          <FileText size={24} />
        </div>
        <h2 className={styles.title}>Generate Payslip</h2>
        <p className={styles.subtitle}>Calculate and send digital payslip via WhatsApp</p>
      </header>

      <div className={styles.driverCard}>
        {driver.photo ? (
          <img src={driver.photo} alt={driver.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserSquare2 size={24} color="var(--color-text-muted)" />
          </div>
        )}
        <div className={styles.driverInfo}>
          <h3>{driver.name}</h3>
          <p>{driver.driverId}</p>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.formGroup}>
            <label>Month</label>
            <select className={styles.select} value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Year</label>
            <select className={styles.select} value={year} onChange={(e) => setYear(e.target.value)}>
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>
              })}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Allowances (₹)</label>
          <div className={styles.inputWrap}>
            <IndianRupee size={16} className={styles.currencyIcon} />
            <input 
              type="number" 
              className={`${styles.input} ${styles.withIcon}`} 
              value={allowances || ''}
              min="0"
              onChange={(e) => setAllowances(Number(e.target.value))}
              placeholder="e.g. 2000"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Deductions (₹)</label>
          <div className={styles.inputWrap}>
            <IndianRupee size={16} className={styles.currencyIcon} />
            <input 
              type="number" 
              className={`${styles.input} ${styles.withIcon}`} 
              value={deductions || ''}
              min="0"
              onChange={(e) => setDeductions(Number(e.target.value))}
              placeholder="e.g. 500"
            />
          </div>
        </div>
      </div>

      <div className={styles.calculator}>
        <div className={styles.calcRow}>
          <span>Base Salary</span>
          <span className={styles.calcValue}>₹{baseSalary.toLocaleString()}</span>
        </div>
        <div className={styles.calcRow}>
          <span>Allowances</span>
          <span className={`${styles.calcValue} ${styles.positive}`}>+ ₹{allowances.toLocaleString()}</span>
        </div>
        <div className={styles.calcRow}>
          <span>Deductions</span>
          <span className={`${styles.calcValue} ${styles.negative}`}>- ₹{deductions.toLocaleString()}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Net Pay</span>
          <span className={styles.totalValue}>₹{netPay.toLocaleString()}</span>
        </div>
      </div>

      <label className={styles.checkboxWrap}>
        <input 
          type="checkbox" 
          checked={recordExpense} 
          onChange={(e) => setRecordExpense(e.target.checked)} 
        />
        <span className={styles.checkboxLabel}>Record as an Expense automatically</span>
      </label>

      <div className={styles.actions}>
        <button 
          className={styles.btnSend} 
          onClick={handleSendWhatsApp}
          disabled={isSubmitting}
        >
          <Send size={18} />
          {isSubmitting ? 'Processing...' : 'Send WhatsApp Payslip'}
        </button>
      </div>

    </div>
  );
}
