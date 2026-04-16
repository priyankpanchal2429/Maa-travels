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
  Printer
} from 'lucide-react';
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
          <p className={styles.subtitle}>{students.length} active service users</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Enroll Student
        </Button>
      </header>

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
                <th>Subscription</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
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
          
          {students.length === 0 && (
            <div className={styles.empty}>
              <Users size={48} className={styles.emptyIcon} />
              <h3>No students enrolled</h3>
              <p>Register students to manage their transport passes.</p>
              <Button variant="secondary" onClick={handleCreate}>Enroll Now</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
