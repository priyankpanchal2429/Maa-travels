'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Plus, Search, Filter, Fuel, Wrench, IndianRupee, 
  Trash2, Edit, TrendingUp, PieChart as PieChartIcon,
  ChevronRight, Calendar
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import expenseService, { Expense } from '@/services/expenseService';
import busService, { Bus } from '@/services/busService';
import { useUI } from '@/context/UIContext';
import Button from '@/components/ui/Button/Button';
import Spinner from '@/components/ui/Spinner/Spinner';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import styles from './page.module.css';

const categoryConfig = {
  fuel: { label: 'Fuel', color: '#10b981' },
  maintenance: { label: 'Maintenance', color: '#f59e0b' },
  salary: { label: 'Salary', color: '#3b82f6' },
  other: { label: 'Other', color: '#8b5cf6' },
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const { openDrawer, closeDrawer, showToast } = useUI();

  const fetchExpenses = useCallback(async () => {
    try {
      const [expRes, busRes] = await Promise.all([
        expenseService.getAll(),
        busService.getAll()
      ]);
      setExpenses(expRes.data.data);
      setBuses(busRes.data.data);
    } catch {
      showToast('Failed to load financial records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || exp.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [expenses, searchQuery, typeFilter]);

  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  /** Analytics Logic: Prepare Pie Chart Data */
  const pieData = useMemo(() => {
    const data: any = {
      fuel: { name: 'Fuel', value: 0, color: categoryConfig.fuel.color },
      maintenance: { name: 'Maintenance', value: 0, color: categoryConfig.maintenance.color },
      salary: { name: 'Salary', value: 0, color: categoryConfig.salary.color },
      other: { name: 'Other', value: 0, color: categoryConfig.other.color },
    };

    filteredExpenses.forEach(exp => {
      const cat = exp.type as keyof typeof data;
      if (data[cat]) data[cat].value += exp.amount;
      else data.other.value += exp.amount;
    });

    return Object.values(data).filter((d: any) => d.value > 0);
  }, [filteredExpenses]);

  const handleCreate = () => {
    openDrawer(
      <ExpenseForm 
        onSuccess={() => {
          closeDrawer();
          fetchExpenses();
          showToast('Expense recorded', 'success');
        }} 
      />
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently remove this financial record?')) {
      try {
        await expenseService.delete(id);
        fetchExpenses();
        showToast('Record purged', 'success');
      } catch {
        showToast('Failed to delete record', 'error');
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Expense Ledger</h1>
          <p className={styles.subtitle}>Audit-ready financial tracking for fleet operations</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Record Expense
        </Button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Filter by description or vendor..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterWrap}>
            <Filter size={14} className={styles.filterIcon} />
            <span className={styles.filterLabel}>Type</span>
            <select 
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Every Category</option>
              <option value="fuel">Fuel</option>
              <option value="maintenance">Maintenance</option>
              <option value="salary">Salary</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className={styles.insightGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Solidified Disbursement</span>
              <span className={styles.statValue}>₹{totalExpense.toLocaleString()}</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#10b981', fontWeight: 700, fontSize: '0.8rem'}}>
                <TrendingUp size={14} />
                <span>Synchronized with Central Bank</span>
              </div>
            </div>

            <div className={styles.chartBox}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Categorical Disbursement Breakdown</h3>
                <PieChartIcon size={16} style={{opacity: 0.5}} />
              </div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {pieData.map((entry: any, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}
                    />
                    <Legend 
                      verticalAlign="middle" 
                      align="right" 
                      layout="vertical"
                      formatter={(value) => <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.list}>
            {filteredExpenses.map((exp) => {
              const bus = buses.find(b => b._id === (exp.busId as any)?._id || b._id === exp.busId);
              return (
                <div key={exp._id} className={styles.item}>
                  <div className={styles.itemIcon} style={{ background: `${categoryConfig[exp.type as keyof typeof categoryConfig]?.color}15`, color: categoryConfig[exp.type as keyof typeof categoryConfig]?.color }}>
                    {exp.type === 'fuel' ? <Fuel size={20} /> : exp.type === 'maintenance' ? <Wrench size={20} /> : <IndianRupee size={20} />}
                  </div>
                  <div className={styles.itemMain}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemDescription}>{exp.description}</span>
                      <span className={styles.itemAmount}>₹{exp.amount.toLocaleString()}</span>
                    </div>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemType}>{exp.type}</span>
                      <span className={styles.dot}>•</span>
                      <span className={styles.itemDate}><Calendar size={12} /> {new Date(exp.date).toLocaleDateString()}</span>
                      {bus && (
                        <>
                          <span className={styles.dot}>•</span>
                          <span className={styles.itemBus}>{bus.busNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <button onClick={() => handleDelete(exp._id)} className={styles.itemBtnDelete}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredExpenses.length === 0 && (
              <div className={styles.empty}>
                <IndianRupee size={48} className={styles.emptyIcon} />
                <h3>No financial records found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
