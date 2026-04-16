'use client';

import { useState } from 'react';
import collegeService from '@/services/collegeService';
import styles from './CollegeForm.module.css';

interface CollegeFormProps {
  onSuccess: () => void;
  initialData?: {
    _id: string;
    name: string;
    code: string;
    address?: string;
  };
}

export default function CollegeForm({ onSuccess, initialData }: CollegeFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !code.trim()) {
      setError('Name and Code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { name: name.trim(), code: code.trim().toUpperCase(), address: address.trim() };
      if (isEditing) {
        await collegeService.update(initialData._id, payload);
      } else {
        await collegeService.create(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{isEditing ? 'Edit College' : 'Add New College'}</h2>
      <p className={styles.subtitle}>
        {isEditing ? 'Update the college details below.' : 'Register a new college for your bus services.'}
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>College Name *</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rajesh Engineering College"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Short Code *</label>
          <input
            type="text"
            className={styles.input}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. REC"
            maxLength={10}
          />
          <span className={styles.hint}>Unique identifier, max 10 characters</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Address</label>
          <input
            type="text"
            className={styles.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123 Main Street, Surat"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update College' : 'Add College'}
        </button>
      </form>
    </div>
  );
}
