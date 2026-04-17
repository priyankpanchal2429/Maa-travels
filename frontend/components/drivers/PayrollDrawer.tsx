'use client';

import React, { useState, useRef, useMemo } from 'react';
import { IndianRupee, FileText, UserSquare2, Download, Clock, Send, Eye, EyeOff, Printer } from 'lucide-react';
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

/** Attendance status for each day */
type DayStatus = 'P' | 'A' | 'H';

const STATUS_CYCLE: DayStatus[] = ['P', 'A', 'H'];
const STATUS_LABELS: Record<DayStatus, string> = { P: 'Present', A: 'Absent', H: 'Half Day' };
const STATUS_COLORS: Record<DayStatus, string> = { P: '#10b981', A: '#ef4444', H: '#f59e0b' };

/** Returns number of days in a given month/year */
function getDaysInMonth(monthName: string, year: number): number {
  const monthIndex = MONTHS.indexOf(monthName);
  return new Date(year, monthIndex + 1, 0).getDate();
}

export default function PayrollDrawer({ driver, onSuccess }: PayrollDrawerProps) {
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Timesheet — daily attendance map (day number → status)
  const totalDays = useMemo(() => getDaysInMonth(month, Number(year)), [month, year]);

  const [attendance, setAttendance] = useState<Record<number, DayStatus>>(() => {
    const init: Record<number, DayStatus> = {};
    for (let d = 1; d <= 31; d++) init[d] = 'P';
    return init;
  });

  // Overtime / adjustments
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [overtimeRate, setOvertimeRate] = useState<number>(100);
  const [allowances, setAllowances] = useState<number>(0);
  const [advances, setAdvances] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);

  const [recordExpense, setRecordExpense] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const payslipRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { showToast } = useUI();

  // ─── Toggle day status on click ───
  const toggleDay = (day: number) => {
    setAttendance(prev => {
      const current = prev[day] || 'P';
      const nextIndex = (STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length;
      return { ...prev, [day]: STATUS_CYCLE[nextIndex] };
    });
  };

  // ─── Derived timesheet stats ───
  const timesheetStats = useMemo(() => {
    let present = 0, absent = 0, halfDay = 0;
    for (let d = 1; d <= totalDays; d++) {
      const s = attendance[d] || 'P';
      if (s === 'P') present++;
      else if (s === 'A') absent++;
      else if (s === 'H') halfDay++;
    }
    const effectiveDays = present + (halfDay * 0.5);
    return { present, absent, halfDay, effectiveDays };
  }, [attendance, totalDays]);

  // ─── Calculations ───
  const baseSalary = driver.salary || 0;
  const dailyWage = baseSalary / totalDays;
  const earnedSalary = Math.round(dailyWage * timesheetStats.effectiveDays);
  const overtimeBonus = overtimeHours * overtimeRate;
  const netPay = earnedSalary + overtimeBonus + allowances - advances - deductions;

  // ─── Payslip data bundle ───
  const payslipData = {
    driver, month, year,
    totalDays,
    daysWorked: timesheetStats.effectiveDays,
    overtimeHours, overtimeRate,
    allowances, advances, deductions,
    baseSalary, earnedSalary, overtimeBonus, netPay,
    // Attendance summary for the template
    presentDays: timesheetStats.present,
    absentDays: timesheetStats.absent,
    halfDays: timesheetStats.halfDay,
  };

  /** Download payslip as PNG and optionally record expense */
  const handleDownload = async () => {
    if (!payslipRef.current) return;
    setIsSubmitting(true);

    try {
      if (recordExpense) {
        await expenseService.create({
          type: 'salary',
          amount: netPay,
          description: `Salary: ${driver.name} — ${month} ${year}`,
        });
        showToast('Payroll recorded in Expenses', 'success');
      }

      const canvas = await html2canvas(payslipRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `Payslip_${driver.name.replace(/\s+/g, '_')}_${month}_${year}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('Payslip downloaded successfully', 'success');
    } catch (error) {
      console.error('Payslip generation error:', error);
      showToast('Failed to generate payslip', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Open WhatsApp chat with pre-filled message */
  const handleWhatsApp = () => {
    let cleanPhone = driver.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const msg = encodeURIComponent(
      `Hi ${driver.name}, your payslip for *${month} ${year}* is attached. Net Pay: *₹${netPay.toLocaleString('en-IN')}*. — Maa Travels`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  /** Print the payslip preview */
  const handlePrint = () => {
    if (!previewRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Payslip - ${driver.name}</title>
      <style>body{margin:0;display:flex;justify-content:center;background:#fff;}@media print{body{background:#fff;}}</style>
      </head><body>${previewRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className={styles.container}>
      {/* Hidden payslip template for html2canvas (always off-screen) */}
      <PayslipTemplate ref={payslipRef} data={payslipData} />

      {/* Visible preview (toggled by user) */}
      {showPreview && (
        <div className={styles.previewWrap}>
          <div ref={previewRef}>
            <PayslipTemplate data={payslipData} />
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.iconBox}>
          <FileText size={24} />
        </div>
        <h2 className={styles.title}>Timesheet & Payslip</h2>
        <p className={styles.subtitle}>Mark daily attendance, then generate payslip</p>
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

      {/* ─── Daily Timesheet Grid ─── */}
      <div className={styles.sectionLabel}>
        <Clock size={14} />
        <span>Daily Attendance — Tap to toggle</span>
      </div>

      {/* Legend */}
      <div className={styles.timesheetLegend}>
        {STATUS_CYCLE.map(s => (
          <div key={s} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: STATUS_COLORS[s] }} />
            <span>{s} = {STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className={styles.timesheetGrid}>
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
          const status = attendance[day] || 'P';
          return (
            <button
              key={day}
              className={styles.dayCell}
              style={{
                borderColor: STATUS_COLORS[status],
                background: `${STATUS_COLORS[status]}15`,
              }}
              onClick={() => toggleDay(day)}
              type="button"
              title={`Day ${day}: ${STATUS_LABELS[status]}`}
            >
              <span className={styles.dayNumber}>{day}</span>
              <span className={styles.dayStatus} style={{ color: STATUS_COLORS[status] }}>{status}</span>
            </button>
          );
        })}
      </div>

      {/* Attendance Summary */}
      <div className={styles.attendanceSummary}>
        <div className={styles.summaryChip} style={{ borderColor: STATUS_COLORS.P }}>
          <span style={{ color: STATUS_COLORS.P, fontWeight: 800 }}>{timesheetStats.present}</span>
          <span>Present</span>
        </div>
        <div className={styles.summaryChip} style={{ borderColor: STATUS_COLORS.H }}>
          <span style={{ color: STATUS_COLORS.H, fontWeight: 800 }}>{timesheetStats.halfDay}</span>
          <span>Half Day</span>
        </div>
        <div className={styles.summaryChip} style={{ borderColor: STATUS_COLORS.A }}>
          <span style={{ color: STATUS_COLORS.A, fontWeight: 800 }}>{timesheetStats.absent}</span>
          <span>Absent</span>
        </div>
        <div className={styles.summaryChip} style={{ borderColor: '#3b82f6' }}>
          <span style={{ color: '#3b82f6', fontWeight: 800 }}>{timesheetStats.effectiveDays}</span>
          <span>Effective</span>
        </div>
      </div>

      {/* Overtime & Adjustments */}
      <div className={styles.sectionLabel}>
        <IndianRupee size={14} />
        <span>Overtime & Adjustments</span>
      </div>

      <div className={styles.formGrid}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
          <div className={styles.formGroup}>
            <label>OT Rate (₹/hr)</label>
            <input
              type="number"
              className={styles.input}
              value={overtimeRate || ''}
              min="0"
              onChange={(e) => setOvertimeRate(Number(e.target.value))}
              placeholder="100"
            />
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
          <span>Earned ({timesheetStats.effectiveDays}/{totalDays} days)</span>
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
          className={styles.btnPreview}
          onClick={() => setShowPreview(!showPreview)}
          type="button"
        >
          {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          {showPreview ? 'Hide' : 'Preview'}
        </button>
        {showPreview && (
          <button
            className={styles.btnPrint}
            onClick={handlePrint}
            type="button"
          >
            <Printer size={18} />
            Print
          </button>
        )}
      </div>
      <div className={styles.actions}>
        <button
          className={styles.btnDownload}
          onClick={handleDownload}
          disabled={isSubmitting}
        >
          <Download size={18} />
          {isSubmitting ? 'Generating...' : 'Download'}
        </button>
        <button
          className={styles.btnWhatsApp}
          onClick={handleWhatsApp}
        >
          <Send size={18} />
          WhatsApp
        </button>
      </div>
    </div>
  );
}
