'use client';

import React, { useState, useRef } from 'react';
import { IndianRupee, FileText, Send, UserSquare2, Download, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useUI } from '@/context/UIContext';
import { Driver } from '@/services/driverService';
import expenseService from '@/services/expenseService';
import PayslipTemplate from './PayslipTemplate';
import styles from './PayrollDrawer.module.css';

interface PayrollDrawerProps {
  driver: Driver;
  onSuccess?: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/** Fixed 30-day month for daily wage calculation */
const DAYS_IN_MONTH = 30;

export default function PayrollDrawer({ driver, onSuccess }: PayrollDrawerProps) {
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Timesheet
  const [daysWorked, setDaysWorked] = useState<number>(DAYS_IN_MONTH);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [overtimeRate, setOvertimeRate] = useState<number>(100);

  // Pay adjustments
  const [allowances, setAllowances] = useState<number>(0);
  const [advances, setAdvances] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);

  const [recordExpense, setRecordExpense] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payslipRef = useRef<HTMLDivElement>(null);
  const { showToast } = useUI();

  // ─── Calculations ───
  const baseSalary = driver.salary || 0;
  const dailyWage = baseSalary / DAYS_IN_MONTH;
  const earnedSalary = Math.round(dailyWage * daysWorked);
  const overtimeBonus = overtimeHours * overtimeRate;
  const netPay = earnedSalary + overtimeBonus + allowances - advances - deductions;

  // ─── Payslip data bundle ───
  const payslipData = {
    driver, month, year,
    totalDays: DAYS_IN_MONTH,
    daysWorked, overtimeHours, overtimeRate,
    allowances, advances, deductions,
    baseSalary, earnedSalary, overtimeBonus, netPay,
  };

  /**
   * Renders the hidden PayslipTemplate to a PNG using html2canvas,
   * triggers a download, and opens the driver's WhatsApp chat.
   */
  const handleGenerateAndSend = async () => {
    if (!payslipRef.current) return;
    setIsSubmitting(true);

    try {
      // 1. Record expense if checked
      if (recordExpense) {
        await expenseService.create({
          type: 'salary',
          amount: netPay,
          description: `Salary: ${driver.name} — ${month} ${year}`,
        });
        showToast('Payroll recorded in Expenses', 'success');
      }

      // 2. Generate PNG from template
      const canvas = await html2canvas(payslipRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });

      // 3. Trigger download
      const link = document.createElement('a');
      link.download = `Payslip_${driver.name.replace(/\s+/g, '_')}_${month}_${year}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('Payslip downloaded! Attach it in the WhatsApp chat.', 'success');

      // 4. Open WhatsApp chat for the driver
      let cleanPhone = driver.phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

      const msg = encodeURIComponent(
        `Hi ${driver.name}, your payslip for *${month} ${year}* is attached. Net Pay: *₹${netPay.toLocaleString('en-IN')}*. — Maa Travels`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Payslip generation error:', error);
      showToast('Failed to generate payslip', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hidden payslip template for html2canvas */}
      <PayslipTemplate ref={payslipRef} data={payslipData} />

      <header className={styles.header}>
        <div className={styles.iconBox}>
          <FileText size={24} />
        </div>
        <h2 className={styles.title}>Timesheet & Payslip</h2>
        <p className={styles.subtitle}>Fill timesheet, calculate pay, and send via WhatsApp</p>
      </header>

      {/* Driver Card */}
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

      {/* Month / Year */}
      <div className={styles.formGrid}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.formGroup}>
            <label>Month</label>
            <select className={styles.select} value={month} onChange={(e) => setMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Year</label>
            <select className={styles.select} value={year} onChange={(e) => setYear(e.target.value)}>
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Timesheet Section */}
        <div className={styles.sectionLabel}>
          <Clock size={14} />
          <span>Timesheet</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.formGroup}>
            <label>Days Worked</label>
            <input
              type="number"
              className={styles.input}
              value={daysWorked || ''}
              min="0"
              max="31"
              onChange={(e) => setDaysWorked(Number(e.target.value))}
              placeholder="30"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Overtime Hours</label>
            <input
              type="number"
              className={styles.input}
              value={overtimeHours || ''}
              min="0"
              onChange={(e) => setOvertimeHours(Number(e.target.value))}
              placeholder="0"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Overtime Rate (₹ / hr)</label>
          <div className={styles.inputWrap}>
            <IndianRupee size={16} className={styles.currencyIcon} />
            <input
              type="number"
              className={`${styles.input} ${styles.withIcon}`}
              value={overtimeRate || ''}
              min="0"
              onChange={(e) => setOvertimeRate(Number(e.target.value))}
              placeholder="100"
            />
          </div>
        </div>

        {/* Pay Adjustments */}
        <div className={styles.sectionLabel}>
          <IndianRupee size={14} />
          <span>Pay Adjustments</span>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.formGroup}>
            <label>Advances (₹)</label>
            <div className={styles.inputWrap}>
              <IndianRupee size={16} className={styles.currencyIcon} />
              <input
                type="number"
                className={`${styles.input} ${styles.withIcon}`}
                value={advances || ''}
                min="0"
                onChange={(e) => setAdvances(Number(e.target.value))}
                placeholder="0"
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
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Summary */}
      <div className={styles.calculator}>
        <div className={styles.calcRow}>
          <span>Base Salary</span>
          <span className={styles.calcValue}>₹{baseSalary.toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.calcRow}>
          <span>Earned ({daysWorked}/{DAYS_IN_MONTH} days)</span>
          <span className={styles.calcValue}>₹{earnedSalary.toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.calcRow}>
          <span>Overtime ({overtimeHours} hrs)</span>
          <span className={`${styles.calcValue} ${styles.positive}`}>+ ₹{overtimeBonus.toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.calcRow}>
          <span>Allowances</span>
          <span className={`${styles.calcValue} ${styles.positive}`}>+ ₹{allowances.toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.calcRow}>
          <span>Advances</span>
          <span className={`${styles.calcValue} ${styles.negative}`}>- ₹{advances.toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.calcRow}>
          <span>Deductions</span>
          <span className={`${styles.calcValue} ${styles.negative}`}>- ₹{deductions.toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Net Pay</span>
          <span className={styles.totalValue}>₹{netPay.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Record Expense Checkbox */}
      <label className={styles.checkboxWrap}>
        <input
          type="checkbox"
          checked={recordExpense}
          onChange={(e) => setRecordExpense(e.target.checked)}
        />
        <span className={styles.checkboxLabel}>Record as an Expense automatically</span>
      </label>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          className={styles.btnSend}
          onClick={handleGenerateAndSend}
          disabled={isSubmitting}
        >
          <Download size={18} />
          {isSubmitting ? 'Generating...' : 'Download & Send WhatsApp'}
        </button>
      </div>
    </div>
  );
}
