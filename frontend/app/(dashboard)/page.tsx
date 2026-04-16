'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, CreditCard, ShieldAlert, ArrowRight, RefreshCw, 
  TrendingUp, IndianRupee, Clock, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import studentService, { Student } from '@/services/studentService';
import paymentService from '@/services/paymentService';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from './page.module.css';

interface InsightStudent {
  _id: string;
  name: string;
  studentId: string;
  amount?: number;
  expiryDate: string;
  parentPhone: string;
}

interface DashboardInsights {
  unpaid: { count: number; students: InsightStudent[] };
  expiring: { count: number; students: InsightStudent[] };
  expired: { count: number; students: InsightStudent[] };
}

export default function DashboardPage() {
  const [studentCount, setStudentCount] = useState(0);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsRes, insightsRes] = await Promise.all([
        studentService.getAll(),
        paymentService.getInsights(),
      ]);

      setStudentCount(studentsRes.data.data.length);
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

  const getRemainingDays = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Maa Travels Hub</h1>
          <p className={styles.subtitle}>Streamlined operational intelligence</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.refreshBtn} onClick={fetchData}>
            <RefreshCw size={14} /> Refresh Pulse
          </button>
        </div>
      </header>

      <main className={styles.pulseLayout}>
        {/* CENTERPIECE: Total Student Pulse */}
        <section className={styles.heroSection}>
          <div className={styles.studentHero}>
            <span className={styles.heroLabel}>Total Enrolled Accounts</span>
            <span className={styles.heroValue}>{studentCount}</span>
            <div className={styles.heroSubtitle}>
              Active Transport Lifelines across all Colleges
            </div>
            {/* Subtle floating glow inside the hero */}
            <div className={styles.heroGlow} />
          </div>
        </section>

        {/* THREAT MATRIX: Unpaid & Expired */}
        <section className={styles.threatMatrix}>
          
          {/* Unpaid Payments Pod */}
          <div className={`${styles.threatCard} ${styles.unpaid}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Unpaid Payments</h2>
              <span className={styles.countBadge}>{insights?.unpaid.count || 0} Found</span>
            </div>
            
            <div className={styles.insightList}>
              {insights?.unpaid.students.map((s) => (
                <div key={s._id} className={styles.insightRow}>
                  <div className={styles.studentInfo}>
                    <span className={styles.studentName}>{s.name}</span>
                    <span className={styles.studentId}>{s.studentId}</span>
                  </div>
                  <div className={styles.metaInfo}>
                    <span className={styles.amount}>₹{(s.amount || 0).toLocaleString()}</span>
                    <span className={styles.date}>Due: {new Date(s.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {(!insights?.unpaid.count) && (
                <div className={styles.emptyState}>
                  <CreditCard size={32} />
                  <p>All accounts are up to date</p>
                </div>
              )}
            </div>
            
            {insights?.unpaid.count ? (
              <Link href="/payments?status=unpaid" className={styles.viewMore}>
                Action Financials <ChevronRight size={14} />
              </Link>
            ) : null}
          </div>

          {/* Expired Passes Pod */}
          <div className={`${styles.threatCard} ${styles.expired}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Expired Passes</h2>
              <span className={styles.countBadge}>{insights?.expired.count || 0} Found</span>
            </div>

            <div className={styles.insightList}>
              {insights?.expired.students.map((s) => (
                <div key={s._id} className={styles.insightRow}>
                  <div className={styles.studentInfo}>
                    <span className={styles.studentName}>{s.name}</span>
                    <span className={styles.studentId}>{s.studentId}</span>
                  </div>
                  <div className={styles.metaInfo}>
                    <span className={styles.daysLeft}>Pass Expired</span>
                    <span className={styles.date}>{new Date(s.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {(!insights?.expired.count) && (
                <div className={styles.emptyState}>
                  <ShieldAlert size={32} />
                  <p>No expired passes in system</p>
                </div>
              )}
            </div>

            {insights?.expired.count ? (
              <Link href="/payments?status=expired" className={styles.viewMore}>
                Manage Clearances <ChevronRight size={14} />
              </Link>
            ) : null}
          </div>

        </section>
      </main>
    </div>
  );
}
