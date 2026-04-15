'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import routeService, { Route, Stop } from '@/services/routeService';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import styles from './RouteForm.module.css';

interface RouteFormProps {
  initialData?: Route;
  onSuccess: () => void;
}

const RouteForm: React.FC<RouteFormProps> = ({ initialData, onSuccess }) => {
  const [routeName, setRouteName] = useState(initialData?.routeName || '');
  const [stops, setStops] = useState<Stop[]>(
    initialData?.stops.sort((a, b) => a.order - b.order) || [{ name: '', order: 1 }]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleAddStop = () => {
    setStops([...stops, { name: '', order: stops.length + 1 }]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length === 1) return;
    const newStops = stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setStops(newStops);
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index].name = value;
    setStops(newStops);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!routeName.trim()) newErrors.routeName = 'Route name is required';
    if (stops.some(s => !s.name.trim())) newErrors.stops = 'All stop names must be filled';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = { routeName, stops };
      if (initialData) {
        await routeService.update(initialData._id, payload);
      } else {
        await routeService.create(payload);
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
        <h2>{initialData ? 'Edit Route' : 'Add New Route'}</h2>
        <p>Define the path and stops for this route</p>
      </div>

      <div className={styles.section}>
        <Input
          label="Route Name"
          placeholder="e.g. North Route - Collage A"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          error={errors.routeName}
          required
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <label className={styles.label}>Stops Sequence</label>
          <button type="button" className={styles.addBtn} onClick={handleAddStop}>
            <Plus size={16} />
            Add Stop
          </button>
        </div>

        <div className={styles.stopsList}>
          {stops.map((stop, index) => (
            <div key={index} className={styles.stopInputGroup}>
              <div className={styles.stopOrder}>
                <GripVertical size={14} className={styles.dragIcon} />
                <span>{stop.order}</span>
              </div>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  placeholder={`Stop ${index + 1} name`}
                  className={styles.stopInput}
                  value={stop.name}
                  onChange={(e) => handleStopChange(index, e.target.value)}
                />
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemoveStop(index)}
                disabled={stops.length === 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        {errors.stops && <p className={styles.errorText}>{errors.stops}</p>}
      </div>

      {errors.global && <p className={styles.errorText}>{errors.global}</p>}

      <div className={styles.footer}>
        <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>
          <Save size={18} />
          {initialData ? 'Update Route' : 'Create Route'}
        </Button>
      </div>
    </form>
  );
};

export default RouteForm;
