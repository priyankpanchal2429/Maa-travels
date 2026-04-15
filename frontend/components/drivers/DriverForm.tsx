'use client';

import React, { useState, useRef } from 'react';
import { Save, UserSquare2, Upload, X } from 'lucide-react';
import driverService, { Driver } from '@/services/driverService';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import styles from './DriverForm.module.css';

interface DriverFormProps {
  initialData?: Driver;
  onSuccess: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({ initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    driverId: initialData?.driverId || '',
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    salary: initialData?.salary || 0,
    isActive: initialData?.isActive ?? true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.photo || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    if (!formData.driverId.trim()) newErrors.driverId = 'Driver ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (formData.salary <= 0) newErrors.salary = 'Invalid salary';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      if (selectedFile) {
        data.append('photo', selectedFile);
      }

      if (initialData) {
        await driverService.update(initialData._id, data);
      } else {
        await driverService.create(data);
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
        <h2>{initialData ? 'Edit Driver' : 'Register New Driver'}</h2>
        <p>Complete the profile and payroll details</p>
      </div>

      <div className={styles.photoUpload}>
        <div className={styles.previewContainer}>
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className={styles.preview} />
              <button 
                type="button" 
                className={styles.removePhoto}
                onClick={() => { setImagePreview(null); setSelectedFile(null); }}
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className={styles.placeholder} onClick={() => fileInputRef.current?.click()}>
              <Upload size={24} />
              <span>Upload Photo</span>
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
        <p className={styles.hint}>Recommended: Square image, max 5MB</p>
      </div>

      <div className={styles.grid}>
        <Input
          label="Driver ID"
          placeholder="e.g. DRV-101"
          value={formData.driverId}
          onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
          error={errors.driverId}
          required
        />
        
        <Input
          label="Full Name"
          placeholder="e.g. Rahul Sharma"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          label="Phone Number"
          placeholder="e.g. +91 9876543210"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
          required
        />

        <Input
          label="Monthly Salary (₹)"
          type="number"
          placeholder="15000"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
          error={errors.salary}
          required
        />
      </div>

      <Input
        label="Residential Address"
        placeholder="Full home address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        error={errors.address}
        required
      />

      <div className={styles.toggleGroup}>
        <label className={styles.toggle}>
          <input 
            type="checkbox" 
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <span className={styles.slider} />
          <span className={styles.toggleLabel}>Active Employee</span>
        </label>
      </div>

      {errors.global && <p className={styles.errorText}>{errors.global}</p>}

      <div className={styles.footer}>
        <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>
          <Save size={18} />
          {initialData ? 'Update Profile' : 'Register Driver'}
        </Button>
      </div>
    </form>
  );
};

export default DriverForm;
