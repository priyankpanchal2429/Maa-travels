'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
  IndianRupee,
  Eye,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { Student } from '@/services/studentService';
import paymentService from '@/services/paymentService';
import collegeService, { College } from '@/services/collegeService';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from './page.module.css';

/**
 * Payments Page — displays all students with payment-centric data.
 * Supports filtering by status, college, and date range.
 */
export default function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const { showToast } = useUI();

  const fetchData = useCallback(async () => {
    try {
      // Build server-side filter params
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const [paymentsRes, collegesRes] = await Promise.all([
        paymentService.getOverview(params),
        collegeService.getAll(),
      ]);
      setStudents(paymentsRes.data.data);
      setColleges(collegesRes.data.data);
    } catch {
      showToast('Failed to load payment data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, statusFilter, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Client-side filtering for search and college (instant, no API call) */
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentPhone?.includes(searchQuery);

      const matchesCollege =
        collegeFilter === 'all' ||
        (typeof student.collegeId === 'object'
          ? student.collegeId?._id === collegeFilter
          : student.collegeId === collegeFilter);

      return matchesSearch && matchesCollege;
    });
  }, [students, searchQuery, collegeFilter]);

  /** Mark a student as paid */
  const handleMarkPaid = async (studentId: string) => {
    try {
      await paymentService.markAsPaid(studentId);
      showToast('Payment marked as paid', 'success');
      fetchData();
    } catch {
      showToast('Failed to update payment status', 'error');
    }
  };

  /** Open WhatsApp reminder with pre-filled message */
  const handleSendReminder = (student: Student) => {
    const phone = student.parentPhone.replace(/\D/g, '');
    // Prefix with India code if not present
    const intlPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const expiryStr = new Date(student.expiryDate).toLocaleDateString();
    const message = encodeURIComponent(
      `Dear Parent, this is a reminder from Maa Travels regarding ${student.name}'s transport pass.\n\n` +
        `Pass Expiry: ${expiryStr}\n` +
        `Amount Due: ₹${(student.amount || 0).toLocaleString()}\n\n` +
        `Please make the payment at your earliest convenience. Thank you.`
    );
    window.open(`https://wa.me/${intlPhone}?text=${message}`, '_blank');
  };

  /** Open native SMS app with pre-filled message */
  const handleSendSMS = (student: Student) => {
    const phone = student.parentPhone.replace(/\D/g, '');
    const expiryStr = new Date(student.expiryDate).toLocaleDateString();
    const message = encodeURIComponent(
      `Maa Travels: ${student.name}'s transport pass expires on ${expiryStr}. Due: ₹${(student.amount || 0).toLocaleString()}. Please pay soon.`
    );
    // Use sms: scheme (Works well on mobile, and macOS Messages app)
    window.open(`sms:${phone}?body=${message}`, '_self');
  };

  /** View Payment History */
  const handleViewHistory = async (student: Student) => {
    setSelectedStudentForHistory(student);
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    try {
      const res = await paymentService.getHistory(student._id);
      setHistoryLogs(res.data.data);
    } catch {
      showToast('Failed to load history', 'error');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  /** Get status badge config based on payment status and expiry */
  const getStatusConfig = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();
    if (isExpired)
      return { label: 'Expired', className: styles.expired, icon: <AlertCircle size={14} /> };

    switch (status) {
      case 'paid':
        return { label: 'Paid', className: styles.paid, icon: <CheckCircle2 size={14} /> };
      case 'bypassed':
        return { label: 'Bypassed', className: styles.bypassed, icon: <Clock size={14} /> };
      default:
        return { label: 'Unpaid', className: styles.unpaid, icon: <AlertCircle size={14} /> };
    }
  };

  /** Check if expiry is within 7 days */
  const getDueDateStatus = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 0) return 'alert';
    if (days <= 7) return 'warning';
    return '';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Payment Registry</h1>
          <p className={styles.subtitle}>
            {filteredStudents.length} {filteredStudents.length === 1 ? 'record' : 'records'} found
          </p>
        </div>
      </header>

      {/* ─── Search & Filter Toolbar ─── */}
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
          {/* Status filter */}
          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <span className={styles.filterLabel}>Status</span>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="bypassed">Bypassed</option>
              <option value="expired">Expired</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>

          <div className={styles.filterDivider} />

          {/* College filter */}
          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <span className={styles.filterLabel}>College</span>
            <select
              className={styles.filterSelect}
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
            >
              <option value="all">All</option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterDivider} />

          {/* Date range filter */}
          <div className={styles.filterWrap}>
            <Calendar size={16} className={styles.filterIcon} />
            <input
              type="date"
              className={styles.dateInput}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              title="From date"
            />
            <span className={styles.filterLabel}>to</span>
            <input
              type="date"
              className={styles.dateInput}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              title="To date"
            />
          </div>
        </div>
      </div>

      {/* ─── Table ─── */}
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
                <th>College</th>
                <th>Route & Stop</th>
                <th>Pass Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const statusCfg = getStatusConfig(student.paymentStatus, student.expiryDate);
                const dueDateStatus = getDueDateStatus(student.expiryDate);

                return (
                  <tr key={student._id}>
                    {/* Student */}
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatarWrap}>
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className={styles.avatar} />
                          ) : (
                            <div className={styles.placeholderAvatar}>
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className={styles.nameInfo}>
                          <p className={styles.name}>{student.name}</p>
                          <p className={styles.id}>{student.studentId}</p>
                        </div>
                      </div>
                    </td>

                    {/* College */}
                    <td>
                      <div>
                        <p className={styles.collegeName}>
                          {typeof student.collegeId === 'object'
                            ? student.collegeId?.name
                            : '—'}
                        </p>
                        <p className={styles.collegeCode}>
                          {typeof student.collegeId === 'object'
                            ? student.collegeId?.code
                            : ''}
                        </p>
                      </div>
                    </td>

                    {/* Route & Stop */}
                    <td>
                      <div className={styles.routeCell}>
                        <div className={styles.routeItem}>
                          <MapPin size={12} />
                          <span>
                            {typeof student.routeId === 'object'
                              ? student.routeId?.routeName
                              : 'No Route'}
                          </span>
                        </div>
                        <div className={styles.stopItem}>{student.stopId}</div>
                      </div>
                    </td>

                    {/* Pass Type */}
                    <td>
                      <span className={styles.passBadge}>
                        {student.duration === '6m' ? '6 Months' : '1 Year'}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`${styles.statusBadge} ${statusCfg.className}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Amount */}
                    <td>
                      <span className={styles.amountValue}>
                        ₹{(student.amount || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td>
                      <div className={`${styles.dueDate} ${dueDateStatus ? styles[dueDateStatus] : ''}`}>
                        <Calendar size={12} />
                        <span>{new Date(student.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtnPay}
                          onClick={() => handleMarkPaid(student._id)}
                          disabled={student.paymentStatus === 'paid'}
                          title="Mark as Paid"
                        >
                          <CheckCircle2 size={14} /> Pay
                        </button>
                        <button
                          className={styles.actionBtnSecondary}
                          onClick={() => handleViewHistory(student)}
                          title="View Payment History"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className={styles.actionBtnRemind}
                          onClick={() => handleSendReminder(student)}
                          title="Send WhatsApp Reminder"
                        >
                          <MessageCircle size={14} />
                        </button>
                        <button
                          className={styles.actionBtnRemindSMS}
                          onClick={() => handleSendSMS(student)}
                          title="Send SMS Reminder"
                        >
                          <Smartphone size={14} />
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
              <CreditCard size={48} className={styles.emptyIcon} />
              <h3>
                {searchQuery || statusFilter !== 'all' || collegeFilter !== 'all'
                  ? 'No matches found'
                  : 'No payment records'}
              </h3>
              <p>
                {searchQuery || statusFilter !== 'all' || collegeFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you are looking for.'
                  : 'Student payment records will appear here once students are enrolled.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── History Modal ─── */}
      {isHistoryModalOpen && selectedStudentForHistory && (
        <div className={styles.modalOverlay} onClick={() => setIsHistoryModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Payment History</h2>
              <button className={styles.closeBtn} onClick={() => setIsHistoryModalOpen(false)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.historyStudentInfo}>
                <span className={styles.historyName}>{selectedStudentForHistory.name}</span>
                <span className={styles.historyId}>{selectedStudentForHistory.studentId}</span>
              </div>
              
              {isHistoryLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                  <Spinner size="md" />
                </div>
              ) : historyLogs.length === 0 ? (
                <div className={styles.historyEmptyState}>
                  <p>No payment logs found for this student.</p>
                </div>
              ) : (
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLogs.map(log => (
                      <tr key={log._id}>
                        <td>{new Date(log.paymentDate).toLocaleString()}</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>₹{log.amountPaid?.toLocaleString() || 0}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{log.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
