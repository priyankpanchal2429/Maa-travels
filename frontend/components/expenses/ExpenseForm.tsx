'use client';

import React, { useState, useEffect } from 'react';
import { Save, IndianRupee, FileText } from 'lucide-react';
import expenseService, { Expense, ExpenseType } from '@/services/expenseService';
import busService, { Bus } from '@/services/busService';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import styles from './ExpenseForm.module.css';

interface ExpenseFormProps {
  initialData?: Expense;
  onSuccess: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSuccess }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [formData, setFormData] = useState({
    type: initialData?.type || 'daily' as ExpenseType,
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    busId: typeof initialData?.busId === 'object' ? initialData.busId._id : initialData?.busId || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const { data } = await busService.getAll();
        setBuses(data.data);
      } catch (err) {
        console.error('Failed to load buses');
      }
    };
    fetchBuses();
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = { 
        ...formData, 
        busId: formData.busId || undefined // Ensure empty string becomes undefined
      };
      
      if (initialData) {
        await expenseService.update(initialData._id, payload);
      } else {
        await expenseService.create(payload);
      }
      onSuccess();
    } catch (err: any) {
      setErrors({ global: err?.response?.data?.message || 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <div className={styles.iconBox}>
          <IndianRupee size={24} />
        </div>
        <h2>{initialData ? 'Edit Expense' : 'Record Expense'}</h2>
        <p>Log your operational costs and overheads</p>
      </div>

      <div className={styles.section}>
        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Expense Type</label>
            <select 
              className={styles.select}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ExpenseType })}
            >
              <option value="daily">Daily / General</option>
              <option value="maintenance">Maintenance</option>
              <option value="fuel">Fuel Cost</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Related Bus (Optional)</label>
            <select 
              className={styles.select}
              value={formData.busId}
              onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
            >
              <option value="">N/A (General)</option>
              {buses.map(b => (
                <option key={b._id} value={b._id}>{b.busNumber}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            error={errors.amount}
            required
          />
          
          <Input
            label="Transaction Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={errors.date}
            required
          />
        </div>

        <Input
          label="Description"
          placeholder="e.g. Monthly Diesel bill, Tire replacement #BV-102"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
          required
          icon={<FileText size={16} />}
        />
      </div>

      {errors.global && <p className={styles.errorText}>{errors.global}</p>}

      <div className={styles.footer}>
        <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>
          <Save size={18} />
          {initialData ? 'Update Ledger' : 'Confirm Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
