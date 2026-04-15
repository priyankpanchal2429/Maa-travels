'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Upload, X, MapPin, Phone, CreditCard } from 'lucide-react';
import studentService, { Student } from '@/services/studentService';
import routeService, { Route } from '@/services/routeService';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import styles from './StudentForm.module.css';

interface StudentFormProps {
  initialData?: Student;
  onSuccess: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSuccess }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [formData, setFormData] = useState({
    studentId: initialData?.studentId || '',
    name: initialData?.name || '',
    parentPhone: initialData?.parentPhone || '',
    duration: initialData?.duration || '6m' as '6m' | '1y',
    routeId: typeof initialData?.routeId === 'object' ? initialData.routeId._id : initialData?.routeId || '',
    stopId: initialData?.stopId || '',
    paymentStatus: initialData?.paymentStatus || 'unpaid' as 'paid' | 'unpaid' | 'bypassed',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.photo || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data } = await routeService.getAll();
        setRoutes(data.data);
      } catch (err) {
        console.error('Failed to load routes');
      }
    };
    fetchRoutes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'Parent phone is required';
    if (!formData.routeId) newErrors.routeId = 'Route selection is required';
    if (!formData.stopId) newErrors.stopId = 'Stop is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateExpiry = (duration: '6m' | '1y') => {
    const date = new Date();
    if (duration === '6m') {
      date.setMonth(date.getMonth() + 6);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      
      // Auto-calculate expiry if new enrollment
      if (!initialData) {
        data.append('expiryDate', calculateExpiry(formData.duration));
      }

      if (selectedFile) {
        data.append('photo', selectedFile);
      }

      if (initialData) {
        await studentService.update(initialData._id, data);
      } else {
        await studentService.create(data);
      }
      onSuccess();
    } catch (err: any) {
      setErrors({ global: err?.response?.data?.message || 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoute = routes.find(r => r._id === formData.routeId);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2>{initialData ? 'Edit Profile' : 'Enroll New Student'}</h2>
        <p>Fill out the details to generate a transport pass</p>
      </div>

      <div className={styles.photoUpload}>
        <div className={styles.previewContainer} onClick={() => fileInputRef.current?.click()}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className={styles.preview} />
          ) : (
            <div className={styles.placeholder}>
              <Upload size={24} />
              <span>Student Photo</span>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>

      <div className={styles.grid}>
        <Input
          label="Student ID / Roll No"
          placeholder="e.g. STU-2024-001"
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          error={errors.studentId}
          required
        />
        
        <Input
          label="Student Full Name"
          placeholder="e.g. Aryan Khan"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />
      </div>

      <Input
        label="Parent/Guardian WhatsApp No"
        placeholder="e.g. 9876543210"
        value={formData.parentPhone}
        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
        error={errors.parentPhone}
        required
        icon={<Phone size={16} />}
      />

      <div className={styles.grid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Select Route</label>
          <select 
            className={styles.select}
            value={formData.routeId}
            onChange={(e) => setFormData({ ...formData, routeId: e.target.value, stopId: '' })}
          >
            <option value="">Choose Route...</option>
            {routes.map(r => (
              <option key={r._id} value={r._id}>{r.routeName}</option>
            ))}
          </select>
          {errors.routeId && <p className={styles.errorText}>{errors.routeId}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Hop-on Stop</label>
          <select 
            className={styles.select}
            value={formData.stopId}
            onChange={(e) => setFormData({ ...formData, stopId: e.target.value })}
            disabled={!formData.routeId}
          >
            <option value="">Select Stop...</option>
            {selectedRoute?.stops.map((s, i) => (
              <option key={i} value={s.name}>{s.name}</option>
            ))}
          </select>
          {errors.stopId && <p className={styles.errorText}>{errors.stopId}</p>}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Subscription Period</label>
          <div className={styles.segmentedControl}>
            <button 
              type="button" 
              className={formData.duration === '6m' ? styles.active : ''}
              onClick={() => setFormData({ ...formData, duration: '6m' })}
            >
              6 Months
            </button>
            <button 
              type="button" 
              className={formData.duration === '1y' ? styles.active : ''}
              onClick={() => setFormData({ ...formData, duration: '1y' })}
            >
              1 Year
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Payment Status</label>
          <select 
            className={styles.select}
            value={formData.paymentStatus}
            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="bypassed">Admin Bypass</option>
          </select>
        </div>
      </div>

      {errors.global && <p className={styles.errorText}>{errors.global}</p>}

      <div className={styles.footer}>
        <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>
          <Save size={18} />
          {initialData ? 'Update Enrollment' : 'Enroll Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
