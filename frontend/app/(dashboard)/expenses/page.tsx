'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  IndianRupee, 
  Settings, 
  Wrench, 
  Fuel, 
  FileText, 
  Trash2, 
  Edit,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useUI } from '@/context/UIContext';
import expenseService, { Expense, ExpenseType } from '@/services/expenseService';
import Button from '@/components/ui/Button/Button';
import Spinner from '@/components/ui/Spinner/Spinner';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import styles from './page.module.css';

const typeConfig = {
  daily: { label: 'Daily', color: '#3b82f6', icon: <FileText size={14} /> },
  maintenance: { label: 'Maintenance', color: '#f59e0b', icon: <Wrench size={14} /> },
  fuel: { label: 'Fuel', color: '#10b981', icon: <Fuel size={14} /> },
  other: { label: 'Other', color: '#a1a1aa', icon: <Settings size={14} /> },
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const { openDrawer, closeDrawer, showToast } = useUI();

  const fetchExpenses = useCallback(async () => {
    try {
      const { data } = await expenseService.getAll({ type: filterType || undefined });
      setExpenses(data.data);
    } catch {
      showToast('Failed to load expenses', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, filterType]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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

  const handleEdit = (expense: Expense) => {
    openDrawer(
      <ExpenseForm 
        initialData={expense}
        onSuccess={() => {
          closeDrawer();
          fetchExpenses();
          showToast('Expense updated', 'success');
        }} 
      />
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense entry?')) {
      try {
        await expenseService.delete(id);
        fetchExpenses();
        showToast('Entry deleted', 'success');
      } catch {
        showToast('Failed to delete entry', 'error');
      }
    }
  };

  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Financial Ledger</h1>
          <p className={styles.subtitle}>Track daily costs and maintenance expenses</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <select 
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="maintenance">Maintenance</option>
              <option value="fuel">Fuel</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Button onClick={handleCreate}>
            <Plus size={18} />
            Record Expense
          </Button>
        </div>
      </header>

      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Total Expenditure</p>
            <h2 className={styles.statValue}>₹{totalAmount.toLocaleString()}</h2>
          </div>
          <div className={styles.statChart}>
            <TrendingUp size={24} className={styles.trendIcon} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={styles.list}>
          {expenses.map((expense) => {
            const config = typeConfig[expense.type];
            return (
              <div key={expense._id} className={styles.item}>
                <div className={styles.itemIcon} style={{ background: `${config.color}20`, color: config.color }}>
                  {config.icon}
                </div>
                
                <div className={styles.itemMain}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemDescription}>{expense.description}</h3>
                    <span className={styles.itemAmount}>₹{expense.amount.toLocaleString()}</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemType}>{config.label}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.itemDate}>{new Date(expense.date).toLocaleDateString()}</span>
                    {expense.busId && (
                      <>
                        <span className={styles.dot}>•</span>
                        <span className={styles.itemBus}>Bus: {typeof expense.busId === 'object' ? expense.busId.busNumber : expense.busId}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.itemActions}>
                  <button onClick={() => handleEdit(expense)} className={styles.itemBtn}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(expense._id)} className={styles.itemBtnDelete}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {expenses.length === 0 && (
            <div className={styles.empty}>
              <IndianRupee size={48} className={styles.emptyIcon} />
              <h3>No expense logs found</h3>
              <p>Start tracking your business overheads here.</p>
              <Button variant="secondary" onClick={handleCreate}>Record First Expense</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
