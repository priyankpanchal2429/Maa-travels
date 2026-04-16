'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, Bus, MapPin, Navigation, IndianRupee, 
  ShieldAlert, CreditCard, RefreshCw, ChevronRight,
  TrendingUp, Settings, Activity, Clock
} from 'lucide-react';
import Link from 'next/link';
import studentService from '@/services/studentService';
import busService from '@/services/busService';
import driverService from '@/services/driverService';
import routeService from '@/services/routeService';
import expenseService from '@/services/expenseService';
import paymentService from '@/services/paymentService';
import adminService from '@/services/adminService';
import { useCollege } from '@/context/CollegeContext';
import { useUI } from '@/context/UIContext';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from './page.module.css';

interface DashboardData {
  students: number;
  buses: { total: number; active: number; maintenance: number };
  drivers: number;
  routes: number;
  insights: any;
  expenses: { total: number; recent: any[] };
}

export default function DashboardPage() {
  const { activeCollegeId, isLoading: isCollegeLoading, activeCollege } = useCollege();
  const { showToast } = useUI();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [threatTab, setThreatTab] = useState<'unpaid' | 'expired'>('unpaid');

  const fetchDashboardData = useCallback(async () => {
    if (isCollegeLoading) return;

    setIsLoading(true);
    try {
      const [
        studentsRes,
        busesRes,
        driversRes,
        routesRes,
        insightsRes,
        expensesRes
      ] = await Promise.all([
        studentService.getAll(),
        busService.getAll(),
        driverService.getAll(),
        routeService.getAll(),
        paymentService.getInsights(),
        expenseService.getAll({ limit: 5 })
      ]);

      const buses = busesRes.data.data;
      const totalExpenses = (expensesRes.data.data as any[]).reduce((acc, curr) => acc + curr.amount, 0);

      setData({
        students: studentsRes.data.count || studentsRes.data.data.length,
        buses: {
          total: buses.length,
          active: buses.filter((b: any) => b.status === 'running').length,
          maintenance: buses.filter((b: any) => b.status === 'maintenance').length,
        },
        drivers: driversRes.data.data.length,
        routes: routesRes.data.data.length,
        insights: insightsRes.data.data,
        expenses: {
          total: totalExpenses,
          recent: expensesRes.data.data
        }
      });
    } catch (err) {
      console.error('Nexus Data Fetch Failed', err);
      showToast('Failed to sync Nexus data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isCollegeLoading, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFixMapping = async () => {
    setIsFixing(true);
    try {
      const res = await adminService.migrateLegacyStudents();
      showToast(res.data.message, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Migration failed', 'error');
    } finally {
      setIsFixing(false);
    }
  };

  if (isLoading || isCollegeLoading) {
    return <div className={styles.loader}><Spinner size="lg" /></div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Operational Nexus</h1>
          <p className={styles.subtitle}>{activeCollege?.name || 'Global Intelligence Overview'}</p>
        </div>
        <div className={styles.actions}>
          {data?.students === 0 && (
            <button className={`${styles.btn} ${styles.primaryBtn}`} onClick={handleFixMapping} disabled={isFixing}>
              {isFixing ? <RefreshCw className="spin" size={14} /> : <ShieldAlert size={14} />}
              Fix Student Mapping
            </button>
          )}
          <button className={`${styles.btn} ${styles.glassBtn}`} onClick={fetchDashboardData}>
            <RefreshCw size={14} /> Refresh Pulse
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {/* HERO: Students */}
        <div className={`${styles.card} ${styles.hero} ${styles.orange}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}><Users size={20} /></div>
            <TrendingUp size={16} />
          </div>
          <span className={styles.heroValue}>{data?.students}</span>
          <span className={styles.heroLabel}>Total Enrolled Accounts</span>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: '85%' }} />
          </div>
        </div>

        {/* STAT: Fleet */}
        <div className={`${styles.card} ${styles.fleet} ${styles.cyan}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}><Bus size={20} /></div>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniValue}>{data?.buses.total}</span>
            <span className={styles.miniLabel}>Total Fleet</span>
          </div>
          <p className={styles.subtitle} style={{marginTop: '0.5rem'}}>Active status monitoring</p>
        </div>

        {/* STAT: Drivers */}
        <div className={`${styles.card} ${styles.drivers} ${styles.magenta}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}><Navigation size={20} /></div>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniValue}>{data?.drivers}</span>
            <span className={styles.miniLabel}>Active Pilots</span>
          </div>
        </div>

        {/* STAT: Routes */}
        <div className={`${styles.card} ${styles.routes} ${styles.amber}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}><MapPin size={20} /></div>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniValue}>{data?.routes}</span>
            <span className={styles.miniLabel}>Network Routes</span>
          </div>
        </div>

        {/* THREAT MATRIX: Tabbed Insights */}
        <div className={`${styles.card} ${styles.threat}`}>
          <div className={styles.threatTabs}>
            <button 
              className={`${styles.tabBtn} ${threatTab === 'unpaid' ? styles.active : ''}`}
              onClick={() => setThreatTab('unpaid')}
            >
              Unpaid ({data?.insights.unpaid.count})
            </button>
            <button 
              className={`${styles.tabBtn} ${threatTab === 'expired' ? styles.active : ''}`}
              onClick={() => setThreatTab('expired')}
            >
              Expired ({data?.insights.expired.count})
            </button>
          </div>

          <div className={styles.insightList}>
            {(threatTab === 'unpaid' ? data?.insights.unpaid.students : data?.insights.expired.students).map((s: any) => (
              <div key={s._id} className={styles.insightRow}>
                <div className={styles.miniStat}>
                  <span className={styles.studentName} style={{fontWeight: 800, fontSize: '0.9rem'}}>{s.name}</span>
                  <span className={styles.miniLabel}>{s.studentId}</span>
                </div>
                <div className={styles.miniStat} style={{alignItems: 'flex-end'}}>
                  <span style={{fontWeight: 900, fontSize: '1rem', color: threatTab === 'unpaid' ? '#f59e0b' : '#ef4444'}}>
                    {threatTab === 'unpaid' ? `₹${s.amount}` : 'EXPIRED'}
                  </span>
                  <span className={styles.miniLabel}>{new Date(s.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {((threatTab === 'unpaid' ? data?.insights.unpaid.count : data?.insights.expired.count) === 0) && (
              <div style={{opacity: 0.5, textAlign: 'center', padding: '2rem'}}>
                All clearances verified
              </div>
            )}
          </div>
          
          <Link href="/payments" className={styles.btn} style={{marginTop: '1.5rem', justifyContent: 'center', background: 'rgba(255,255,255,0.05)'}}>
            Detailed Clearance Hub <ChevronRight size={14} />
          </Link>
        </div>

        {/* STAT: Economy Summary */}
        <div className={`${styles.card} ${styles.economy} ${styles.amber}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}><IndianRupee size={20} /></div>
            <Activity size={16} />
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniValue}>₹{data?.expenses.total.toLocaleString()}</span>
            <span className={styles.miniLabel}>Recent Expenditure</span>
          </div>
          <div className={styles.insightList} style={{marginTop: '1rem', maxHeight: '180px'}}>
            {data?.expenses.recent.map((e: any) => (
              <div key={e._id} style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', padding:'0.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <span>{e.description}</span>
                <span style={{fontWeight: 800}}>₹{e.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VITALITY: Detailed Status */}
        <div className={`${styles.card} ${styles.vitality}`}>
          <div className={styles.cardHeader}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 900}}>Fleet Vitality</h2>
            <Settings size={18} />
          </div>
          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Running Buses</span>
              <span className={styles.statusValue} style={{color: '#10b981'}}>{data?.buses.active}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Under Maintenance</span>
              <span className={styles.statusValue} style={{color: '#ef4444'}}>{data?.buses.maintenance}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Idle/Standby</span>
              <span className={styles.statusValue}>{data?.buses.total - data?.buses.active - data?.buses.maintenance}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Avg Fuel Type</span>
              <span className={styles.statusValue}>Diesel</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
