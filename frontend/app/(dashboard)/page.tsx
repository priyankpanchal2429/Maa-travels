'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, Bus, MapPin, Navigation, IndianRupee, 
  ShieldAlert, RefreshCw, ChevronRight,
  TrendingUp, Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import Link from 'next/link';
import paymentService from '@/services/paymentService';
import adminService from '@/services/adminService';
import dashboardService from '@/services/dashboardService';
import { useCollege } from '@/context/CollegeContext';
import { useUI } from '@/context/UIContext';
import Spinner from '@/components/ui/Spinner/Spinner';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import QuickCommandRow from '@/components/dashboard/QuickCommandRow';
import ActivityPulse from '@/components/dashboard/ActivityPulse';
import styles from './page.module.css';

const DashboardSkeleton = () => (
  <div className={styles.container}>
    <header className={styles.header}>
      <div className={styles.title}><Skeleton width={300} height={40} /><Skeleton width={200} height={20} style={{ marginTop: '0.5rem' }} /></div>
    </header>
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.hero}`}><Skeleton width="100%" height="100%" borderRadius={24} /></div>
      <div className={styles.card}><Skeleton width="100%" height="100%" borderRadius={24} /></div>
      <div className={styles.card}><Skeleton width="100%" height="100%" borderRadius={24} /></div>
      <div className={styles.card}><Skeleton width="100%" height="100%" borderRadius={24} /></div>
    </div>
  </div>
);

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
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [threatTab, setThreatTab] = useState<'unpaid' | 'expired'>('unpaid');

  const DASHBOARD_CACHE_KEY = 'maa-travels-dashboard-snapshot';
  const ANALYTICS_CACHE_KEY = 'maa-travels-analytics-snapshot';

  const fetchDashboardData = useCallback(async () => {
    if (isCollegeLoading) return;
    const hasCache = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!hasCache) setIsLoading(true);

    try {
      const [nexusRes, insightsRes, analyticsRes] = await Promise.allSettled([
        dashboardService.getOverview(activeCollegeId || undefined),
        paymentService.getInsights(),
        dashboardService.getAnalytics(activeCollegeId || undefined)
      ]);

      const isOk = (result: any) => result.status === 'fulfilled';
      
      const nexusData = isOk(nexusRes) ? (nexusRes as any).value.data.data : null;
      const insights = isOk(insightsRes) ? (insightsRes as any).value.data.data : null;
      const analyticsData = isOk(analyticsRes) ? (analyticsRes as any).value.data.data : [];

      if (nexusData && insights) {
        const dashboardSnapshot = {
          students: nexusData.counts.students,
          buses: nexusData.counts.buses,
          drivers: nexusData.counts.drivers,
          routes: nexusData.counts.routes,
          insights,
          expenses: nexusData.expenses
        };

        setData(dashboardSnapshot);
        setAnalytics(analyticsData);
        localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(dashboardSnapshot));
        localStorage.setItem(ANALYTICS_CACHE_KEY, JSON.stringify(analyticsData));
      }
    } catch (err) {
      showToast('Update Failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeCollegeId, isCollegeLoading, showToast]);

  useEffect(() => {
    const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
    const cachedAnalytics = localStorage.getItem(ANALYTICS_CACHE_KEY);
    if (cached) setData(JSON.parse(cached));
    if (cachedAnalytics) setAnalytics(JSON.parse(cachedAnalytics));
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFixMapping = async () => {
    setIsFixing(true);
    try {
      const res = await adminService.migrateLegacyStudents();
      showToast(res.data.message, 'success');
      fetchDashboardData();
    } catch {
      showToast('Error fixing records', 'error');
    } finally {
      setIsFixing(false);
    }
  };

  if (isCollegeLoading || (isLoading && !data)) return <DashboardSkeleton />;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Main Board</h1>
          <p className={styles.subtitle}>{activeCollege?.name || 'Overview'}</p>
        </div>
        <div className={styles.actions}>
          {data?.students === 0 && (
            <button className={`${styles.btn} ${styles.primaryBtn}`} onClick={handleFixMapping} disabled={isFixing}>
              {isFixing ? <RefreshCw className="spin" size={14} /> : <ShieldAlert size={14} />} Fix Records
            </button>
          )}
          <button className={`${styles.btn} ${styles.glassBtn}`} onClick={fetchDashboardData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {/* HERO: Students */}
        <div className={`${styles.card} ${styles.hero} ${styles.orange}`}>
          <div className={styles.cardHeader}><div className={styles.cardIcon}><Users size={20} /></div><TrendingUp size={16} /></div>
          <span className={styles.heroValue}>{data?.students}</span>
          <span className={styles.heroLabel}>Total Students</span>
          <div className={styles.progressContainer}><div className={styles.progressBar} style={{ width: '85%' }} /></div>
        </div>

        {/* STAT: Fleet */}
        <div className={`${styles.card} ${styles.fleet} ${styles.cyan}`}>
          <div className={styles.cardHeader}><div className={styles.cardIcon}><Bus size={20} /></div></div>
          <div className={styles.miniStat}><span className={styles.miniValue}>{data?.buses.total}</span><span className={styles.miniLabel}>Total Buses</span></div>
          <div className={styles.sparklineContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{v:10},{v:15},{v:13},{v:20},{v:18},{v:25}]}>
                <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STAT: Drivers */}
        <div className={`${styles.card} ${styles.drivers} ${styles.magenta}`}>
          <div className={styles.cardHeader}><div className={styles.cardIcon}><Navigation size={20} /></div></div>
          <div className={styles.miniStat}><span className={styles.miniValue}>{data?.drivers}</span><span className={styles.miniLabel}>Active Drivers</span></div>
          <div className={styles.sparklineContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{v:5},{v:7},{v:6},{v:9},{v:10},{v:8}]}>
                <Line type="monotone" dataKey="v" stroke="#d946ef" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STAT: Routes */}
        <div className={`${styles.card} ${styles.routes} ${styles.amber}`}>
          <div className={styles.cardHeader}><div className={styles.cardIcon}><MapPin size={20} /></div></div>
          <div className={styles.miniStat}><span className={styles.miniValue}>{data?.routes}</span><span className={styles.miniLabel}>Total Routes</span></div>
          <div className={styles.sparklineContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{v:2},{v:3},{v:2},{v:5},{v:4},{v:6}]}>
                <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QUICK COMMANDS */}
        <section className={styles.command}>
          <QuickCommandRow />
        </section>

        {/* THREAT MATRIX */}
        <div className={`${styles.card} ${styles.threat}`}>
          <div className={styles.threatBalance}>
            <div className={styles.threatSegmentUnpaid} style={{ width: `${Math.max(10, ((data?.insights?.unpaid?.count || 1) / (((data?.insights?.unpaid?.count || 1) + (data?.insights?.expired?.count || 0)) || 1)) * 100)}%` }} />
            <div className={styles.threatSegmentExpired} style={{ width: `${Math.max(10, ((data?.insights?.expired?.count || 0) / (((data?.insights?.unpaid?.count || 1) + (data?.insights?.expired?.count || 0)) || 1)) * 100)}%` }} />
          </div>
          <div className={styles.threatTabs}>
            <button className={`${styles.tabBtn} ${threatTab === 'unpaid' ? styles.active : ''}`} onClick={() => setThreatTab('unpaid')}>
              Unpaid ({data?.insights?.unpaid?.count ?? 0})
            </button>
            <button className={`${styles.tabBtn} ${threatTab === 'expired' ? styles.active : ''}`} onClick={() => setThreatTab('expired')}>
              Expired ({data?.insights?.expired?.count ?? 0})
            </button>
          </div>
          <div className={styles.insightList}>
            {(threatTab === 'unpaid' ? (data?.insights?.unpaid?.students || []) : (data?.insights?.expired?.students || [])).map((s: any) => (
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
          </div>
          <Link href="/payments" className={styles.btn} style={{marginTop: '1.5rem', justifyContent: 'center', background: 'rgba(255,255,255,0.05)'}}>
            Go to Payments <ChevronRight size={14} />
          </Link>
        </div>

        {/* ACTIVITY PULSE */}
        <div className={styles.activity}>
          <ActivityPulse />
        </div>

        {/* STAT: Economy Analytics */}
        <div className={`${styles.card} ${styles.economy}`}>
          <div className={styles.cardHeader}><div className={styles.cardIcon}><IndianRupee size={20} /></div>
            <div className={styles.analyticsTitle}><h2 style={{fontSize: '1rem', fontWeight: 900}}>Money Stats</h2><span className={styles.miniLabel}>Income vs Spending</span></div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 10}} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.miniStat} style={{marginTop: '1.5rem'}}>
            <span className={styles.miniValue}>₹{(data?.expenses.total ?? 0).toLocaleString()}</span><span className={styles.miniLabel}>Total Money Spent</span>
          </div>
        </div>

        {/* VITALITY */}
        <div className={`${styles.card} ${styles.vitality}`}>
          <div className={styles.cardHeader}><h2 style={{fontSize: '1.25rem', fontWeight: 900}}>Bus Stats</h2><Settings size={18} /></div>
          <div className={styles.pieContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Running', value: data?.buses.active || 1, color: '#10b981' },
                    { name: 'Repairs', value: data?.buses.maintenance || 0, color: '#ef4444' },
                    { name: 'Idle', value: Math.max(0, (data?.buses.total || 0) - (data?.buses.active || 0) - (data?.buses.maintenance || 0)), color: '#6b7280' }
                  ]}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#6b7280" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.pieLegend}>
            <div className={styles.pieLegendItem}><div className={styles.pieLegendDot} style={{background: '#10b981'}} />Running</div>
            <div className={styles.pieLegendItem}><div className={styles.pieLegendDot} style={{background: '#ef4444'}} />Repairs</div>
            <div className={styles.pieLegendItem}><div className={styles.pieLegendDot} style={{background: '#6b7280'}} />Idle</div>
          </div>
        </div>

      </div>
    </div>
  );
}
