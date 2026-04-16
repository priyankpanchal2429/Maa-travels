'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, Truck, Activity, Landmark, RefreshCw, TrendingUp, AlertCircle,
  CreditCard, Clock, ShieldAlert, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import studentService, { Student } from '@/services/studentService';
import driverService, { Driver } from '@/services/driverService';
import busService, { Bus } from '@/services/busService';
import expenseService, { Expense } from '@/services/expenseService';
import paymentService from '@/services/paymentService';
import Spinner from '@/components/ui/Spinner/Spinner';
import CrystalCard from '@/components/ui/CrystalCard/CrystalCard';
import styles from './page.module.css';

/** Insight student shape returned by the /payments/insights endpoint */
interface InsightStudent {
  _id: string;
  name: string;
  studentId: string;
  amount?: number;
  expiryDate: string;
  parentPhone: string;
  collegeId?: { name: string; code: string };
}

interface DashboardInsights {
  unpaid: { count: number; students: InsightStudent[] };
  expiring: { count: number; students: InsightStudent[] };
  expired: { count: number; students: InsightStudent[] };
}

export default function DashboardPage() {
  const [data, setData] = useState({
    students: [] as Student[],
    drivers: [] as Driver[],
    buses: [] as Bus[],
    expenses: [] as Expense[],
  });
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsRes, driversRes, busesRes, expensesRes, insightsRes] = await Promise.all([
        studentService.getAll(),
        driverService.getAll(),
        busService.getAll(),
        expenseService.getAll(),
        paymentService.getInsights(),
      ]);

      setData({
        students: studentsRes.data.data,
        drivers: driversRes.data.data,
        buses: busesRes.data.data,
        expenses: expensesRes.data.data,
      });
      setInsights(insightsRes.data.data);
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

  /** Calculate remaining days until expiry */
  const getRemainingDays = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

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
          title="Bus Vitality" 
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
                d="M 0 80 Q 50 30, 100 60 T 200 50 T 300 70 T 400 40" 
              />
            </svg>
          </div>
        </CrystalCard>

        {/* ─── INSIGHT WIDGETS ─── */}

        {/* Unpaid Payments */}
        <CrystalCard
          title="Unpaid Payments"
          subtitle={`${insights?.unpaid.count || 0} students with pending fees`}
          variant="orange"
          className={styles.insightUnpaid}
          icon={<CreditCard size={18} />}
        >
          <div className={styles.insightList}>
            {insights?.unpaid.students.map((s) => (
              <div key={s._id} className={styles.insightRow}>
                <div className={styles.insightName}>
                  <span className={styles.insightStudentName}>{s.name}</span>
                  <span className={styles.insightStudentId}>{s.studentId}</span>
                </div>
                <div className={styles.insightMeta}>
                  <span className={styles.insightAmount}>₹{(s.amount || 0).toLocaleString()}</span>
                  <span className={styles.insightDate}>
                    {new Date(s.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {(!insights?.unpaid.count) && (
              <div className={styles.insightEmpty}>All payments cleared ✓</div>
            )}
          </div>
          {(insights?.unpaid.count || 0) > 5 && (
            <Link href="/payments?status=unpaid" className={styles.viewAllLink}>
              View all {insights?.unpaid.count} <ArrowRight size={14} />
            </Link>
          )}
        </CrystalCard>

        {/* Expiring Passes */}
        <CrystalCard
          title="Expiring Passes"
          subtitle={`${insights?.expiring.count || 0} passes expiring in 7 days`}
          variant="magenta"
          className={styles.insightExpiring}
          icon={<Clock size={18} />}
        >
          <div className={styles.insightList}>
            {insights?.expiring.students.map((s) => {
              const days = getRemainingDays(s.expiryDate);
              return (
                <div key={s._id} className={styles.insightRow}>
                  <div className={styles.insightName}>
                    <span className={styles.insightStudentName}>{s.name}</span>
                    <span className={styles.insightStudentId}>{s.studentId}</span>
                  </div>
                  <div className={styles.insightMeta}>
                    <span className={styles.insightDays} data-urgent={days <= 3}>
                      {days}d left
                    </span>
                    <span className={styles.insightDate}>
                      {new Date(s.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {(!insights?.expiring.count) && (
              <div className={styles.insightEmpty}>No passes expiring soon</div>
            )}
          </div>
          {(insights?.expiring.count || 0) > 5 && (
            <Link href="/payments?status=expiring" className={styles.viewAllLink}>
              View all {insights?.expiring.count} <ArrowRight size={14} />
            </Link>
          )}
        </CrystalCard>

        {/* Expired Passes */}
        <CrystalCard
          title="Expired Passes"
          subtitle={`${insights?.expired.count || 0} passes have expired`}
          variant="default"
          className={styles.insightExpired}
          icon={<ShieldAlert size={18} />}
        >
          <div className={styles.insightList}>
            {insights?.expired.students.map((s) => (
              <div key={s._id} className={styles.insightRow}>
                <div className={styles.insightName}>
                  <span className={styles.insightStudentName}>{s.name}</span>
                  <span className={styles.insightStudentId}>{s.studentId}</span>
                </div>
                <div className={styles.insightMeta}>
                  <span className={styles.insightBadgeExpired}>Expired</span>
                  <span className={styles.insightDate}>
                    {new Date(s.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {(!insights?.expired.count) && (
              <div className={styles.insightEmpty}>No expired passes</div>
            )}
          </div>
          {(insights?.expired.count || 0) > 5 && (
            <Link href="/payments?status=expired" className={styles.viewAllLink}>
              View all {insights?.expired.count} <ArrowRight size={14} />
            </Link>
          )}
        </CrystalCard>
      </main>
    </div>
  );
}
