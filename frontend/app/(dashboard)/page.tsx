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

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ color: '#6366f1' }}>
              <Users size={20} />
            </div>
            <TrendingUp size={16} className={styles.itemDetail} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Students Enrolled</span>
            <span className={styles.statValue}>{data.students.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ color: '#10b981' }}>
              <BusIcon size={20} />
            </div>
            <Activity size={16} className={styles.itemDetail} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Buses on Route</span>
            <span className={styles.statValue}>{activeBusesCount}/{data.buses.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ color: '#f59e0b' }}>
              <UserSquare2 size={20} />
            </div>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Drivers</span>
            <span className={styles.statValue}>{data.drivers.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ color: '#ef4444' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Monthly Expenses</span>
            <span className={styles.statValue}>₹{totalExpenses.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left: Alerts & Fleet Status */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Activity size={16} />
              Fleet Deployment
            </h2>
            <Link href="/buses" className={styles.viewAll}>View Full Fleet</Link>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.list}>
              {data.buses.slice(0, 5).map(bus => (
                <div key={bus._id} className={styles.listItem}>
                  <div 
                    className={styles.statusIndicator} 
                    style={{ '--status-color': bus.status === 'running' ? '#10b981' : bus.status === 'maintenance' ? '#f59e0b' : '#334155' } as any} 
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
        </div>

        {/* Right: Upcoming Expiries */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <AlertTriangle size={16} style={{ color: '#ef4444' }} />
              Expiring Soon
            </h2>
            <Link href="/students" className={styles.viewAll}>Manage All</Link>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.list}>
              {expirations.slice(0, 5).map(student => (
                <div key={student._id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{student.name}</p>
                    <p className={styles.itemDetail}>Exp: {new Date(student.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.itemValue} style={{ color: '#ef4444' }}>
                    {Math.ceil((new Date(student.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d left
                  </div>
                </div>
              ))}
              {expirations.length === 0 && <p className={styles.itemDetail}>No upcoming expiries this week.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
