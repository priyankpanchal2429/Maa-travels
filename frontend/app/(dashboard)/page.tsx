'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  BarChart3, RefreshCw, Calendar as CalendarIcon, Filter
} from 'lucide-react';
import studentService, { Student } from '@/services/studentService';
import driverService, { Driver } from '@/services/driverService';
import busService, { Bus } from '@/services/busService';
import expenseService, { Expense } from '@/services/expenseService';
import Spinner from '@/components/ui/Spinner/Spinner';
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
  
  // Fleet Status
  const runningBuses = data.buses.filter(b => b.status === 'running').length;
  const maintenanceBuses = data.buses.filter(b => b.status === 'maintenance').length;
  const outOfServiceBuses = data.buses.filter(b => b.status === 'out_of_service').length;
  const totalBuses = data.buses.length || 1; // avoid division by zero
  
  const pctRunning = (runningBuses / totalBuses) * 100;
  const pctMaint = (maintenanceBuses / totalBuses) * 100;

  // Expirations
  const now = new Date().getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  let exp7 = 0;
  let exp30 = 0;
  let safe = 0;
  
  data.students.forEach(s => {
    const diff = new Date(s.expiryDate).getTime() - now;
    if (diff <= 0) exp7++; 
    else if (diff <= 7 * dayMs) exp7++;
    else if (diff <= 30 * dayMs) exp30++;
    else safe++;
  });
  
  const totalStudents = data.students.length || 1;
  const pctExp7 = (exp7 / totalStudents) * 100;
  const pctExp30 = (exp30 / totalStudents) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.lastUpdated}>Last Updated just now</span>
        <button className={styles.dateRangeBtn}>
          14-10-2025 To 14-04-2026 <CalendarIcon size={12} />
        </button>
        <button className={styles.refreshBtn} onClick={fetchData}>
          Refresh <RefreshCw size={12} />
        </button>
      </div>

      <div className={styles.grid}>
        
        {/* Row 1 - Card 1: Students */}
        <div className={`${styles.card} ${styles.cardThird}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Students Enrolled</h2>
            </div>
          </div>
          <div className={styles.cardBodyRow}>
            <div className={styles.cardMetrics}>
              <span className={styles.cardDate}>Apr 2026</span>
              <span className={styles.cardValue}>{data.students.length}</span>
              <span className={styles.cardSubValue}>+ Total active accounts</span>
            </div>
            <div className={styles.barChart}>
              <div className={styles.bar} style={{ height: '20%' }} />
              <div className={styles.bar} style={{ height: '60%' }} />
              <div className={styles.bar} style={{ height: '30%' }} />
              <div className={styles.bar} style={{ height: '100%' }} />
              <div className={styles.bar} style={{ height: '80%' }} />
            </div>
          </div>
        </div>

        {/* Row 1 - Card 2: Drivers */}
        <div className={`${styles.card} ${styles.cardThird}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Active Drivers</h2>
            </div>
          </div>
          <div className={styles.cardBodyRow}>
            <div className={styles.cardMetrics}>
              <span className={styles.cardDate}>Apr 2026</span>
              <span className={styles.cardValue}>{data.drivers.length}</span>
              <span className={styles.cardSubValue}>+ Currently employed</span>
            </div>
            <div className={styles.barChart}>
              <div className={styles.bar} style={{ height: '40%' }} />
              <div className={styles.bar} style={{ height: '80%' }} />
              <div className={styles.bar} style={{ height: '50%' }} />
              <div className={styles.bar} style={{ height: '90%' }} />
              <div className={styles.bar} style={{ height: '20%' }} />
            </div>
          </div>
        </div>

        {/* Row 1 - Card 3: Expenses Donut */}
        <div className={`${styles.card} ${styles.cardThird}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Financial Overview</h2>
            <BarChart3 className={styles.cardIcon} size={16} />
          </div>
          <div className={styles.donutContainer}>
            <div className={styles.donutWrapper}>
              <div className={`${styles.donut} ${styles.donut1}`} />
              <div style={{ textAlign: 'center' }}>
                <div className={styles.donutLabel}>Expense</div>
                <div className={styles.donutValue}>₹ {totalExpenses.toLocaleString()}</div>
              </div>
            </div>
            <div className={styles.donutWrapper}>
              <div className={`${styles.donut} ${styles.donut2}`} />
              <div style={{ textAlign: 'center' }}>
                <div className={styles.donutLabel}>Income</div>
                <div className={styles.donutValue}>₹ 3,000</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 - Card 4: Fleet Progress */}
        <div className={`${styles.card} ${styles.cardHalf}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Fleet Status</h2>
            <Filter className={styles.cardIcon} size={16} />
          </div>
          <div className={styles.progressContainer}>
            <div>
              <div className={styles.progressHeader}>
                <span>Total Vehicles ₹ {data.buses.length}.00</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressSegment} style={{ width: `${pctRunning}%`, background: 'var(--color-primary)' }} />
                <div className={styles.progressSegment} style={{ width: `${pctMaint}%`, background: '#f59e0b' }} />
                <div className={styles.progressSegment} style={{ width: `${100 - pctRunning - pctMaint}%`, background: 'var(--color-border-hover)' }} />
              </div>
            </div>
            
            <div className={styles.progressLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendHeader}>
                  <div className={styles.legendDot} style={{ background: 'var(--color-primary)' }} /> CURRENT
                </div>
                <div className={styles.legendValue}>{runningBuses} Active</div>
                <div className={styles.legendSub}>Running</div>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendHeader}>
                  <div className={styles.legendDot} style={{ background: '#f59e0b' }} /> OVERDUE
                </div>
                <div className={styles.legendValue}>{maintenanceBuses} Pending</div>
                <div className={styles.legendSub}>Maintenance</div>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendHeader}>
                  <div className={styles.legendDot} style={{ background: '#ef4444' }} /> SEVERE
                </div>
                <div className={styles.legendValue}>{outOfServiceBuses} Offline</div>
                <div className={styles.legendSub}>Out of Service</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 - Card 5: Subscriptions Progress */}
        <div className={`${styles.card} ${styles.cardHalf}`}>
           <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Subscription Outstanding</h2>
            <Filter className={styles.cardIcon} size={16} />
          </div>
          <div className={styles.progressContainer}>
            <div>
              <div className={styles.progressHeader}>
                <span>Total Payables ₹ {data.students.length * 15000}.00</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressSegment} style={{ width: `${100 - pctExp7 - pctExp30}%`, background: 'var(--color-primary)' }} />
                <div className={styles.progressSegment} style={{ width: `${pctExp30}%`, background: '#f59e0b' }} />
                <div className={styles.progressSegment} style={{ width: `${pctExp7}%`, background: '#ef4444' }} />
              </div>
            </div>
            
            <div className={styles.progressLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendHeader}>
                  <div className={styles.legendDot} style={{ background: 'var(--color-primary)' }} /> CURRENT
                </div>
                <div className={styles.legendValue}>₹ {(safe * 15000).toLocaleString()}.00</div>
                <div className={styles.legendSub}>Active</div>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendHeader}>
                  <div className={styles.legendDot} style={{ background: '#f59e0b' }} /> OVERDUE
                </div>
                <div className={styles.legendValue}>₹ {(exp30 * 15000).toLocaleString()}.00</div>
                <div className={styles.legendSub}>1-30 Days</div>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendHeader}>
                  <div className={styles.legendDot} style={{ background: '#ef4444' }} />
                </div>
                <div className={styles.legendValue}>₹ {(exp7 * 15000).toLocaleString()}.00</div>
                <div className={styles.legendSub}>Immediate</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
