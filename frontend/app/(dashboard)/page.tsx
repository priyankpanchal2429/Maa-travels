'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, Truck, Activity, Landmark, RefreshCw, TrendingUp, AlertCircle
} from 'lucide-react';
import studentService, { Student } from '@/services/studentService';
import driverService, { Driver } from '@/services/driverService';
import busService, { Bus } from '@/services/busService';
import expenseService, { Expense } from '@/services/expenseService';
import Spinner from '@/components/ui/Spinner/Spinner';
import CrystalCard from '@/components/ui/CrystalCard/CrystalCard';
import styles from './page.module.css';

export default function DashboardPage() {
  const [data, setData] = useState({
    students: [] as Student[],
    drivers: [] as Driver[],
    buses: [] as Bus[],
    expenses: [] as Expense[],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsRes, driversRes, busesRes, expensesRes] = await Promise.all([
        studentService.getAll(),
        driverService.getAll(),
        busService.getAll(),
        expenseService.getAll(),
      ]);

      setData({
        students: studentsRes.data.data,
        drivers: driversRes.data.data,
        buses: busesRes.data.data,
        expenses: expensesRes.data.data,
      });
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <Spinner size="lg" />
      </div>
    );
  }

  // Aggregations
  const totalExpenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const runningBuses = data.buses.filter(b => b.status === 'running').length;
  const activeFleetPct = data.buses.length > 0 ? Math.round((runningBuses / data.buses.length) * 100) : 0;
  
  // Expirations
  const now = new Date().getTime();
  const expiringSoon = data.students.filter(s => {
    const diff = new Date(s.expiryDate).getTime() - now;
    return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 7;
  }).length;

  return (
    <div className={styles.container}>
      <header className={styles.toolbar}>
        <div className={styles.titleSection}>
          <h1>Dashboard Overview</h1>
          <p className={styles.subtitle}>Welcome back to Maa Travels Ops Hub</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.refreshBtn} onClick={fetchData}>
            Sync Data <RefreshCw size={14} />
          </button>
        </div>
      </header>

      <main className={styles.grid}>
        {/* LARGE: Fleet Vitality Pulse */}
        <CrystalCard 
          title="Fleet Vitality" 
          subtitle="Real-time operational health" 
          variant="cyan"
          className={styles.vitality}
          icon={<Activity size={18} />}
          pulse={activeFleetPct > 80}
        >
          <div className={styles.pulseContainer}>
            <div className={styles.pulseOrb}>
              <span className={styles.orbValue}>{activeFleetPct}%</span>
              <span className={styles.orbLabel}>Active</span>
            </div>
            <div className={styles.fleetLegent}>
              <div className={styles.legendItem}>
                <span className={styles.legendValue}>{runningBuses}</span>
                <span className={styles.legendLabel}>Running</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendValue}>{data.buses.length - runningBuses}</span>
                <span className={styles.legendLabel}>In Pits</span>
              </div>
            </div>
          </div>
        </CrystalCard>

        {/* SMALL: Students */}
        <CrystalCard 
          title="Students" 
          subtitle="Enrolled accounts" 
          variant="default"
          className={styles.students}
          icon={<Users size={18} />}
        >
          <div className={styles.metricValue}>{data.students.length}</div>
          <div className={`${styles.metricTrend} ${styles.trendUp}`}>
            <TrendingUp size={14} /> +12% from last month
          </div>
        </CrystalCard>

        {/* SMALL: Drivers */}
        <CrystalCard 
          title="Field Workforce" 
          subtitle="On-duty drivers" 
          variant="default"
          className={styles.drivers}
          icon={<Truck size={18} />}
        >
          <div className={styles.metricValue}>{data.drivers.length}</div>
          <div className={styles.metricTrend}>
            <Activity size={14} /> All drivers compliant
          </div>
        </CrystalCard>

        {/* MEDIUM: Economic Pulse Sparkline */}
        <CrystalCard 
          title="Economic Pulse" 
          subtitle="Expenditure velocity trends" 
          variant="magenta"
          className={styles.economy}
          icon={<Landmark size={18} />}
        >
          <div className={styles.metricValue}>₹ {totalExpenses.toLocaleString()}</div>
          <div className={styles.sparklineContainer}>
             <svg className={styles.sparklineSvg} viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path 
                className={styles.sparklinePath} 
                d="M 0 100 Q 50 10, 100 80 T 200 40 T 300 90 T 400 20" 
              />
            </svg>
          </div>
        </CrystalCard>

        {/* FULL WIDTH: Live Alerts & Activity */}
        <CrystalCard 
          title="Operational Intel" 
          subtitle="Prioritized system alerts" 
          variant="orange"
          className={styles.activity}
          icon={<AlertCircle size={18} />}
        >
          <div className={styles.alertList}>
            {expiringSoon > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ padding: '0.5rem', background: '#ef4444', borderRadius: '50%', color: 'white' }}>
                  <AlertCircle size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Critical Subscription Expiry</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{expiringSoon} student accounts are set to expire within 7 days.</p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                No critical alerts today. All systems green.
              </div>
            )}
          </div>
        </CrystalCard>
      </main>
    </div>
  );
}
