'use client';

import React, { useState } from 'react';
import { Save, Truck } from 'lucide-react';
import busService, { Bus, BusStatus } from '@/services/busService';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import styles from './BusForm.module.css';

interface BusFormProps {
  initialData?: Bus;
  onSuccess: () => void;
}

const BusForm: React.FC<BusFormProps> = ({ initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    busNumber: initialData?.busNumber || '',
    plateNumber: initialData?.plateNumber || '',
    capacity: initialData?.capacity || 40,
    status: initialData?.status || 'idle' as BusStatus,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.busNumber.trim()) newErrors.busNumber = 'Bus identifier is required';
    if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
    if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (initialData) {
        await busService.update(initialData._id, formData);
      } else {
        await busService.create(formData);
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
          <Truck size={24} />
        </div>
        <h2>{initialData ? 'Edit Vehicle' : 'Register New Bus'}</h2>
        <p>Update your fleet details and capacity</p>
      </div>

      <div className={styles.section}>
        <Input
          label="Bus Number / ID"
          placeholder="e.g. BUS-001"
          value={formData.busNumber}
          onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
          error={errors.busNumber}
          required
        />
        
        <Input
          label="Plate Number"
          placeholder="e.g. MH 12 AB 1234"
          value={formData.plateNumber}
          onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
          error={errors.plateNumber}
          required
        />

        <Input
          label="Seating Capacity"
          type="number"
          placeholder="40"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
          error={errors.capacity}
          required
        />

        <div className={styles.statusGroup}>
          <label className={styles.label}>Initial Status</label>
          <div className={styles.radioGroup}>
            {(['idle', 'running', 'maintenance'] as BusStatus[]).map((s) => (
              <label key={s} className={[styles.radioLabel, formData.status === s ? styles.active : ''].join(' ')}>
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={formData.status === s}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BusStatus })}
                  className={styles.hiddenRadio}
                />
                <span className={styles.radioText}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {errors.global && <p className={styles.errorText}>{errors.global}</p>}

      <div className={styles.footer}>
        <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>
          <Save size={18} />
          {initialData ? 'Update Vehicle' : 'Create Vehicle'}
        </Button>
      </div>
    </form>
  );
};

export default BusForm;
