'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Bus as BusIcon, 
  Map as MapIcon, 
  IndianRupee, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  UserSquare2
} from 'lucide-react';
import Link from 'next/link';
import studentService, { Student } from '@/services/studentService';
import driverService, { Driver } from '@/services/driverService';
import busService, { Bus } from '@/services/busService';
import routeService, { Route } from '@/services/routeService';
import expenseService, { Expense } from '@/services/expenseService';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from './page.module.css';

export default function DashboardPage() {
  const [data, setData] = useState({
    students: [] as Student[],
    drivers: [] as Driver[],
    buses: [] as Bus[],
    routes: [] as Route[],
    expenses: [] as Expense[],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [studentsRes, driversRes, busesRes, routesRes, expensesRes] = await Promise.all([
        studentService.getAll(),
        driverService.getAll(),
        busService.getAll(),
        routeService.getAll(),
        expenseService.getAll(),
      ]);

      setData({
        students: studentsRes.data.data,
        drivers: driversRes.data.data,
        buses: busesRes.data.data,
        routes: routesRes.data.data,
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
  const activeBusesCount = data.buses.filter(b => b.status === 'running').length;
  const expirations = data.students.filter(s => {
    const diff = new Date(s.expiryDate).getTime() - new Date().getTime();
    return diff > 0 && diff <= (7 * 24 * 60 * 60 * 1000); // 1 week
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className="text-gradient">Control Center</h1>
        <p className={styles.subtitle}>Welcome back, here's what's happening today.</p>
      </header>

      <div className={styles.bentoGrid}>
        
        {/* Primary massive card */}
        <div className={`${styles.bentoCard} ${styles.cardPrimary}`}>
          <div className={styles.statHeader}>
            <div className={styles.iconBox}>
              <BusIcon size={24} />
            </div>
            <Activity size={20} style={{ color: 'rgba(0,0,0,0.5)' }} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Buses on Route</span>
            <span className={styles.statValue}>{activeBusesCount} <span style={{fontSize: '2rem', color: 'rgba(0,0,0,0.4)'}}>/ {data.buses.length}</span></span>
          </div>
        </div>

        {/* Smaller Metric Cards */}
        <div className={`bento-card ${styles.cardMetric}`}>
          <div className={styles.statHeader}>
            <div className={styles.iconBox} style={{ color: 'var(--color-primary)' }}>
              <Users size={20} />
            </div>
            <TrendingUp size={16} className={styles.itemDetail} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Students Enrolled</span>
            <span className={styles.statValue}>{data.students.length}</span>
          </div>
        </div>

        <div className={`bento-card ${styles.cardMetric}`}>
          <div className={styles.statHeader}>
            <div className={styles.iconBox}>
              <UserSquare2 size={20} />
            </div>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Drivers</span>
            <span className={styles.statValue}>{data.drivers.length}</span>
          </div>
        </div>

        {/* Lists taking up bottom spans */}
        <div className={`bento-card ${styles.cardListLeft}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Fleet Status
            </h2>
            <Link href="/buses" className={styles.viewAll}>View Fleet →</Link>
          </div>
          <div className={styles.list}>
            {data.buses.slice(0, 5).map(bus => (
              <div key={bus._id} className={styles.listItem}>
                <div 
                  className={styles.statusIndicator} 
                  style={{ '--status-color': bus.status === 'running' ? 'var(--color-primary)' : bus.status === 'maintenance' ? 'var(--color-warning)' : 'var(--color-border-hover)' } as any} 
                />
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{bus.busNumber}</p>
                  <p className={styles.itemDetail}>{bus.plateNumber}</p>
                </div>
                <div className={styles.itemStatus}>{bus.status}</div>
              </div>
            ))}
            {data.buses.length === 0 && <p className={styles.itemDetail}>No buses registered.</p>}
          </div>
        </div>

        <div className={`bento-card ${styles.cardListRight}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Impending Expirations
            </h2>
            <Link href="/students" className={styles.viewAll}>View All →</Link>
          </div>
          <div className={styles.list}>
            {expirations.slice(0, 5).map(student => (
              <div key={student._id} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{student.name}</p>
                  <p className={styles.itemDetail}>Exp: {new Date(student.expiryDate).toLocaleDateString()}</p>
                </div>
                <div className={styles.itemStatus} style={{ color: 'var(--color-error)' }}>
                  {Math.ceil((new Date(student.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d left
                </div>
              </div>
            ))}
            {expirations.length === 0 && <p className={styles.itemDetail}>No upcoming expiries this week.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
