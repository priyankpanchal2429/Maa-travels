'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Users, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Printer,
  Search,
  Filter
} from 'lucide-react';
import { useMemo } from 'react';
import { useUI } from '@/context/UIContext';
import studentService, { Student } from '@/services/studentService';
import Button from '@/components/ui/Button/Button';
import Spinner from '@/components/ui/Spinner/Spinner';
import StudentForm from '@/components/students/StudentForm';
import StudentPass from '@/components/students/StudentPass';
import styles from './page.module.css';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const { openDrawer, closeDrawer, showToast } = useUI();

  const fetchStudents = useCallback(async () => {
    try {
      const { data } = await studentService.getAll();
      setStudents(data.data);
    } catch {
      showToast('Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentPhone?.includes(searchQuery) ||
        student.address?.toLowerCase().includes(searchQuery.toLowerCase());

      const isExpired = new Date(student.expiryDate) < new Date();
      let matchesStatus = true;
      if (statusFilter === 'expired') matchesStatus = isExpired;
      else if (statusFilter === 'paid') matchesStatus = student.paymentStatus === 'paid' && !isExpired;
      else if (statusFilter === 'unpaid') matchesStatus = student.paymentStatus === 'unpaid' && !isExpired;
      else if (statusFilter === 'bypassed') matchesStatus = student.paymentStatus === 'bypassed' && !isExpired;

      const matchesDuration = durationFilter === 'all' || student.duration === durationFilter;

      return matchesSearch && matchesStatus && matchesDuration;
    });
  }, [students, searchQuery, statusFilter, durationFilter]);

  const handleCreate = () => {
    openDrawer(
      <StudentForm 
        onSuccess={() => {
          closeDrawer();
          fetchStudents();
          showToast('Student enrolled successfully', 'success');
        }} 
      />
    );
  };

  const handleEdit = (student: Student) => {
    openDrawer(
      <StudentForm 
        initialData={student}
        onSuccess={() => {
          closeDrawer();
          fetchStudents();
          showToast('Student profile updated', 'success');
        }} 
      />
    );
  };

  const handlePrint = (student: Student) => {
    openDrawer(<StudentPass student={student} />);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student record?')) {
      try {
        await studentService.delete(id);
        fetchStudents();
        showToast('Student deleted', 'success');
      } catch {
        showToast('Failed to delete student', 'error');
      }
    }
  };

  const getStatusConfig = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();
    if (isExpired) return { label: 'Expired', className: styles.expired, icon: <AlertCircle size={14} /> };
    
    switch (status) {
      case 'paid': return { label: 'Paid', className: styles.paid, icon: <CheckCircle2 size={14} /> };
      case 'bypassed': return { label: 'Bypassed', className: styles.bypassed, icon: <Clock size={14} /> };
      default: return { label: 'Unpaid', className: styles.unpaid, icon: <AlertCircle size={14} /> };
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 7;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Student Subscriptions</h1>
          <p className={styles.subtitle}>
            {filteredStudents.length} {filteredStudents.length === 1 ? 'user' : 'users'} found
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Enroll Student
        </Button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by name, ID or phone..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <span className={styles.filterLabel}>Status</span>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Active & Paid</option>
              <option value="unpaid">Unpaid Records</option>
              <option value="bypassed">Bypassed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className={styles.filterDivider} />

          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <span className={styles.filterLabel}>Plan</span>
            <select 
              className={styles.filterSelect}
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="all">Any Duration</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Route & Stop</th>
                <th>Address</th>
                <th>Subscription</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const status = getStatusConfig(student.paymentStatus, student.expiryDate);
                const expiringSoon = isExpiringSoon(student.expiryDate);
                
                return (
                  <tr key={student._id}>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatarWrap}>
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className={styles.avatar} />
                          ) : (
                            <div className={styles.placeholderAvatar}>{student.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className={styles.nameInfo}>
                          <p className={styles.name}>{student.name}</p>
                          <p className={styles.id}>{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.routeCell}>
                        <div className={styles.routeItem}>
                          <MapPin size={12} />
                          <span>{student.routeId?.routeName || 'No Route'}</span>
                        </div>
                        <div className={styles.stopItem}>
                          <span>{student.stopId}</span>
                        </div>
                      </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.addressCell}>
                        <span className={styles.addressText}>{student.address}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.subCell}>
                        <div className={styles.subType}>{student.duration === '6m' ? '6 Months' : '1 Year'}</div>
                        <div className={[styles.expiry, expiringSoon ? styles.alert : ''].join(' ')}>
                          <Calendar size={12} />
                          <span>Exp: {new Date(student.expiryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={[styles.statusBadge, status.className].join(' ')}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => handleEdit(student)} className={styles.actionBtn}>
                          <Edit size={16} /> Edit
                        </button>
                        <button 
                          className={styles.printBtn} 
                          disabled={student.paymentStatus === 'unpaid'}
                          onClick={() => handlePrint(student)}
                          title="Print ID Card"
                        >
                          <Printer size={16} /> Print
                        </button>
                        <button onClick={() => handleDelete(student._id)} className={styles.actionBtnDelete}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className={styles.empty}>
              <Users size={48} className={styles.emptyIcon} />
              <h3>{searchQuery || statusFilter !== 'all' || durationFilter !== 'all' ? 'No matches found' : 'No students enrolled'}</h3>
              <p>
                {searchQuery || statusFilter !== 'all' || durationFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you are looking for.' 
                  : 'Register students to manage their transport passes.'}
              </p>
              {!searchQuery && statusFilter === 'all' && durationFilter === 'all' && (
                <Button variant="secondary" onClick={handleCreate}>Enroll Now</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
