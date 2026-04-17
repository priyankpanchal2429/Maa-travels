'use client';

import React, { forwardRef } from 'react';
import { Driver } from '@/services/driverService';

/**
 * PayslipTemplate — A visually rich, self-contained HTML component 
 * designed exclusively for html2canvas rendering. Uses inline styles 
 * so the rendered image looks identical regardless of CSS context.
 */

interface PayslipData {
  driver: Driver;
  month: string;
  year: string;
  totalDays: number;
  daysWorked: number;
  overtimeHours: number;
  overtimeRate: number;
  allowances: number;
  advances: number;
  deductions: number;
  baseSalary: number;
  earnedSalary: number;
  overtimeBonus: number;
  netPay: number;
  presentDays?: number;
  absentDays?: number;
  halfDays?: number;
}

const PayslipTemplate = forwardRef<HTMLDivElement, { data: PayslipData }>(
  ({ data }, ref) => {
    const { driver, month, year, totalDays, daysWorked, overtimeHours, overtimeRate,
      allowances, advances, deductions, baseSalary, earnedSalary, overtimeBonus, netPay,
      presentDays = 0, absentDays = 0, halfDays = 0 } = data;

    return (
      <div
        ref={ref}
        style={{
          width: 600,
          padding: 40,
          background: 'linear-gradient(145deg, #0a0e1a 0%, #111827 50%, #0a0e1a 100%)',
          color: '#e5e7eb',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.08)',
          position: 'absolute',
          left: -9999,
          top: 0,
          zIndex: -1,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#ccff00', letterSpacing: '-0.03em' }}>
              MAA TRAVELS
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Monthly Payslip
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>{month} {year}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280', fontWeight: 700 }}>
              Generated: {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(204,255,0,0.3), transparent)', marginBottom: 28 }} />

        {/* Driver Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          {driver.photo ? (
            <img
              src={driver.photo}
              alt={driver.name}
              style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(204,255,0,0.3)' }}
            />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 14, background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#6b7280', border: '2px solid rgba(255,255,255,0.1)' }}>
              {driver.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>{driver.name}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: '#ccff00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {driver.driverId}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
              Phone: {driver.phone}
            </p>
          </div>
        </div>

        {/* Timesheet Section */}
        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Timesheet Summary
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Present', value: presentDays, color: '#10b981' },
            { label: 'Half Day', value: halfDays, color: '#f59e0b' },
            { label: 'Absent', value: absentDays, color: '#ef4444' },
          ].map((item) => (
            <div key={item.label} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: `1px solid ${item.color}30`, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: item.color }}>{item.value}</p>
              <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#3b82f6' }}>{daysWorked}</p>
            <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Effective Days</p>
          </div>
          <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>{overtimeHours}</p>
            <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Overtime Hrs</p>
          </div>
        </div>

        {/* Pay Breakdown */}
        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Pay Breakdown
        </p>
        <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
          {[
            { label: 'Base Salary (Monthly)', value: `₹${baseSalary.toLocaleString('en-IN')}`, color: '#e5e7eb' },
            { label: `Earned (${daysWorked}/${totalDays} days)`, value: `₹${earnedSalary.toLocaleString('en-IN')}`, color: '#e5e7eb' },
            { label: `Overtime (${overtimeHours} hrs × ₹${overtimeRate})`, value: `+ ₹${overtimeBonus.toLocaleString('en-IN')}`, color: '#10b981' },
            { label: 'Allowances', value: `+ ₹${allowances.toLocaleString('en-IN')}`, color: '#10b981' },
            { label: 'Advances Recovered', value: `- ₹${advances.toLocaleString('en-IN')}`, color: '#ef4444' },
            { label: 'Other Deductions', value: `- ₹${deductions.toLocaleString('en-IN')}`, color: '#ef4444' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Net Pay */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, background: 'linear-gradient(135deg, rgba(204,255,0,0.08), rgba(204,255,0,0.02))', borderRadius: 16, border: '1px solid rgba(204,255,0,0.15)' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>NET PAY</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#ccff00', letterSpacing: '-0.02em' }}>
            ₹{netPay.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Footer */}
        <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 10, color: '#4b5563', fontWeight: 600 }}>
          This is a system-generated payslip from Maa Travels Console. For queries, contact the admin.
        </p>
      </div>
    );
  }
);

PayslipTemplate.displayName = 'PayslipTemplate';
export default PayslipTemplate;
