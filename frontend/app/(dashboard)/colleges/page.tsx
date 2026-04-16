'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2, Building2, MapPin, Plus, Check, X } from 'lucide-react';
import collegeService, { College } from '@/services/collegeService';
import CrystalCard from '@/components/ui/CrystalCard/CrystalCard';
import Modal from '@/components/ui/Modal/Modal';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from './page.module.css';

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [formData, setFormData] = useState<Partial<College>>({});

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    try {
      const { data } = await collegeService.getAll();
      setColleges(data.data);
    } catch (err) {
      console.error('Failed to load colleges');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (college: College) => {
    setEditingCollege(college);
    setFormData({ name: college.name, code: college.code, address: college.address });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this college?')) return;
    try {
      await collegeService.delete(id);
      loadColleges();
    } catch (err) {
      console.error('Failed to delete college');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;

    try {
      await collegeService.update(editingCollege._id, formData);
      setIsModalOpen(false);
      loadColleges();
    } catch (err) {
      console.error('Failed to update college');
    }
  };

  if (isLoading) return <div className={styles.loader}><Spinner size="lg" /></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>Institutions Hub</h1>
          <p className={styles.subtitle}>Active institution networks and campus management</p>
        </div>
        <button className={styles.addBtn} disabled>
          Register New <Plus size={14} />
        </button>
      </header>

      <div className={styles.grid}>
        {colleges.map((college) => (
          <CrystalCard 
            key={college._id} 
            variant={college.isActive ? 'cyan' : 'default'}
            className={styles.collegeCard}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconCircle}>
                <Building2 size={24} />
              </div>
              <div className={styles.badges}>
                <span className={styles.codeBadge}>{college.code}</span>
                {college.isActive && <span className={styles.activeBadge}>Active</span>}
              </div>
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.collegeName}>{college.name}</h3>
              <div className={styles.address}>
                <MapPin size={14} />
                <span>{college.address || 'No address specified'}</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button 
                className={styles.editBtn} 
                onClick={() => handleEdit(college)}
                title="Edit Details"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button 
                className={styles.deleteBtn} 
                onClick={() => handleDelete(college._id)}
                title="Deactivate College"
              >
                <Trash2 size={16} /> Deactivate
              </button>
            </div>
          </CrystalCard>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Edit Institution Details"
      >
        <form onSubmit={handleSave} className={styles.editForm}>
          <div className={styles.inputGroup}>
            <label>Institution Name</label>
            <input 
              type="text" 
              value={formData.name || ''} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Institution Code</label>
            <input 
              type="text" 
              value={formData.code || ''} 
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Campus Address</label>
            <textarea 
              value={formData.address || ''} 
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
              <X size={16} /> Cancel
            </button>
            <button type="submit" className={styles.saveBtn}>
              <Check size={16} /> Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
