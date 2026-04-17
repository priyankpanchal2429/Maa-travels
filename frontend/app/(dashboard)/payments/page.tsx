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
  Smartphone,
  Download,
  TrendingUp,
  AlertTriangle,
  X
} from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { Student } from '@/services/studentService';
import paymentService from '@/services/paymentService';
import collegeService, { College } from '@/services/collegeService';
import routeService, { Route } from '@/services/routeService';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from './page.module.css';

/**
 * Professional Payment Registry — Command center for financial operations.
 * Features: Financial summaries, CSV export, Route filtering, and detailed payment logging.
 */
export default function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Modal State: Payment Confirmation
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Modal State: History
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const { showToast } = useUI();

  const fetchData = useCallback(async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const [paymentsRes, collegesRes, routesRes] = await Promise.all([
        paymentService.getOverview(params),
        collegeService.getAll(),
        routeService.getAll(),
      ]);
      setStudents(paymentsRes.data.data);
      setColleges(collegesRes.data.data);
      setRoutes(routesRes.data.data);
    } catch {
      showToast('Failed to load registry data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, statusFilter, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Refined filtering logic for search, college, and routes */
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

      const matchesRoute =
        routeFilter === 'all' ||
        (typeof student.routeId === 'object'
          ? student.routeId?._id === routeFilter
          : student.routeId === routeFilter);

      return matchesSearch && matchesCollege && matchesRoute;
    });
  }, [students, searchQuery, collegeFilter, routeFilter]);

  /** Financial intelligence summary */
  const financialStats = useMemo(() => {
    const stats = {
      totalCollected: 0,
      totalPending: 0,
      expiredCount: 0
    };

    filteredStudents.forEach(student => {
      const isExpired = new Date(student.expiryDate) < new Date();
      if (isExpired) {
        stats.expiredCount++;
      }
      
      const amount = student.amount || 0;
      if (student.paymentStatus === 'paid') {
        stats.totalCollected += amount;
      } else {
        stats.totalPending += amount;
      }
    });

    return stats;
  }, [filteredStudents]);

  /** Trigger Payment Modal */
  const handleOpenPaymentModal = (student: Student) => {
    setSelectedStudentForPayment(student);
    setPaymentMethod('Cash');
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  /** Execute Transactional Payment Recording */
  const handleConfirmPayment = async () => {
    if (!selectedStudentForPayment) return;
    setIsProcessingPayment(true);
    try {
      await paymentService.markAsPaid(selectedStudentForPayment._id, {
        paymentMethod,
        notes: paymentNotes
      });
      showToast('Payment successfully solidified in history', 'success');
      setIsPaymentModalOpen(false);
      fetchData();
    } catch (err) {
      showToast('Transaction failed. please check connectivity.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  /** Export current view to CSV */
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;
    
    const headers = ['Name', 'Student ID', 'College', 'Route', 'Status', 'Expiry', 'Amount'];
    const rows = filteredStudents.map(s => [
      s.name,
      s.studentId,
      typeof s.collegeId === 'object' ? s.collegeId.code : s.collegeId,
      typeof s.routeId === 'object' ? s.routeId.routeName : 'N/A',
      s.paymentStatus.toUpperCase(),
      new Date(s.expiryDate).toLocaleDateString(),
      s.amount
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `maa_travels_payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /** Remind via Communications */
  const handleSendReminder = (student: Student, channel: 'wa' | 'sms') => {
    const phone = student.parentPhone.replace(/\D/g, '');
    const intlPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const expiryStr = new Date(student.expiryDate).toLocaleDateString();
    
    if (channel === 'wa') {
      const message = encodeURIComponent(
        `Dear Parent, this is a reminder from Maa Travels regarding ${student.name}'s transport pass.\n\n` +
          `Pass Expiry: ${expiryStr}\n` +
          `Amount Due: ₹${(student.amount || 0).toLocaleString()}\n\n` +
          `Please make the payment at your earliest convenience. Thank you.`
      );
      window.open(`https://wa.me/${intlPhone}?text=${message}`, '_blank');
    } else {
      const message = encodeURIComponent(
        `Maa Travels: ${student.name}'s transport pass expires on ${expiryStr}. Due: ₹${(student.amount || 0).toLocaleString()}. Please pay soon.`
      );
      window.open(`sms:${phone}?body=${message}`, '_self');
    }
  };

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

  const getStatusConfig = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();
    if (isExpired) return { label: 'Expired', className: styles.expired, icon: <AlertCircle size={14} /> };
    switch (status) {
      case 'paid': return { label: 'Paid', className: styles.paid, icon: <CheckCircle2 size={14} /> };
      case 'bypassed': return { label: 'Bypassed', className: styles.bypassed, icon: <Clock size={14} /> };
      default: return { label: 'Unpaid', className: styles.unpaid, icon: <AlertCircle size={14} /> };
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Financial Ledger</h1>
          <p className={styles.subtitle}>Audit-ready registry with professional oversight</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exportBtn} onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>

      {/* ─── Financial Summary Bar ─── */}
      <div className={styles.summaryHeader}>
        <div className={`${styles.summaryCard} ${styles.glowGreen}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardValue}>₹{financialStats.totalCollected.toLocaleString()}</span>
            <span className={styles.cardLabel}>Solidified Revenue</span>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.glowOrange}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>
              <IndianRupee size={24} />
            </div>
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardValue}>₹{financialStats.totalPending.toLocaleString()}</span>
            <span className={styles.cardLabel}>Pending Collection</span>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.glowRed}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardValue}>{financialStats.expiredCount}</span>
            <span className={styles.cardLabel}>Urgent Pass Renewals</span>
          </div>
        </div>
      </div>

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
          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="bypassed">Bypassed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className={styles.filterDivider} />

          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <select className={styles.filterSelect} value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)}>
              <option value="all">All Colleges</option>
              {colleges.map((c) => (<option key={c._id} value={c._id}>{c.code}</option>))}
            </select>
          </div>

          <div className={styles.filterDivider} />

          <div className={styles.filterWrap}>
            <MapPin size={16} className={styles.filterIcon} />
            <select className={styles.filterSelect} value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}>
              <option value="all">All Routes</option>
              {routes.map((r) => (<option key={r._id} value={r._id}>{r.routeName}</option>))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}><Spinner size="lg" /></div>
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
                const isOverdue = new Date(student.expiryDate) < new Date() && student.paymentStatus !== 'paid';

                return (
                  <tr key={student._id}>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatarWrap}>
                          {student.photo ? <img src={student.photo} alt={student.name} className={styles.avatar} /> : <div className={styles.placeholderAvatar}>{student.name.charAt(0)}</div>}
                        </div>
                        <div className={styles.nameInfo}>
                          <p className={styles.name}>{student.name}</p>
                          <p className={styles.id}>{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className={styles.collegeName}>{typeof student.collegeId === 'object' ? student.collegeId?.name : '—'}</p>
                        <p className={styles.collegeCode}>{typeof student.collegeId === 'object' ? student.collegeId?.code : ''}</p>
                      </div>
                    </td>
                    <td>
                      <div className={styles.routeCell}>
                        <div className={styles.routeItem}><MapPin size={12} /><span>{typeof student.routeId === 'object' ? student.routeId?.routeName : 'No Route'}</span></div>
                        <div className={styles.stopItem}>{student.stopId}</div>
                      </div>
                    </td>
                    <td><span className={styles.passBadge}>{student.duration === '6m' ? '6 Months' : '1 Year'}</span></td>
                    <td><span className={`${styles.statusBadge} ${statusCfg.className}`}>{statusCfg.icon}{statusCfg.label}</span></td>
                    <td><span className={styles.amountValue}>₹{(student.amount || 0).toLocaleString()}</span></td>
                    <td>
                      <div className={`${styles.dueDate} ${isOverdue ? styles.alert : ''}`}>
                        <Calendar size={12} /><span>{new Date(student.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtnPay} onClick={() => handleOpenPaymentModal(student)} disabled={student.paymentStatus === 'paid'} title="Process Payment"><CheckCircle2 size={14} /></button>
                        <button className={styles.actionBtnSecondary} onClick={() => handleViewHistory(student)} title="Audit History"><Eye size={14} /></button>
                        <button className={styles.actionBtnRemind} onClick={() => handleSendReminder(student, 'wa')} title="WhatsApp Reminder"><MessageCircle size={14} /></button>
                        <button className={styles.actionBtnRemindSMS} onClick={() => handleSendReminder(student, 'sms')} title="SMS Reminder"><Smartphone size={14} /></button>
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
              <h3>No matching records</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── PAYMENT CONFIRMATION MODAL ─── */}
      {isPaymentModalOpen && selectedStudentForPayment && (
        <div className={styles.modalOverlay} onClick={() => setIsPaymentModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Record Payment</h2>
              <button className={styles.closeBtn} onClick={() => setIsPaymentModalOpen(false)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.historyStudentInfo}>
                <p className={styles.historyName}>{selectedStudentForPayment.name}</p>
                <p className={styles.historyId}>{selectedStudentForPayment.studentId}</p>
                <p style={{marginTop: '0.5rem', fontWeight: 900, fontSize: '1.25rem', color: 'var(--color-primary)'}}>
                   Due: ₹{(selectedStudentForPayment.amount || 0).toLocaleString()}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Payment Method</label>
                <select className={styles.formSelect} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / GPay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Notes / Transaction ID</label>
                <textarea 
                  className={styles.formTextarea} 
                  placeholder="Optional notes or reference number..."
                  rows={3}
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                />
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.btnCancel} onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
                <button className={styles.btnPrimary} onClick={handleConfirmPayment} disabled={isProcessingPayment}>
                  {isProcessingPayment ? <Spinner size="sm" /> : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HISTORY MODAL ─── */}
      {isHistoryModalOpen && selectedStudentForHistory && (
        <div className={styles.modalOverlay} onClick={() => setIsHistoryModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Transaction History</h2>
              <button className={styles.closeBtn} onClick={() => setIsHistoryModalOpen(false)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.historyStudentInfo}>
                <span className={styles.historyName}>{selectedStudentForHistory.name}</span>
                <span className={styles.historyId}>{selectedStudentForHistory.studentId}</span>
              </div>
              
              {isHistoryLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}><Spinner size="md" /></div>
              ) : historyLogs.length === 0 ? (
                <div className={styles.historyEmptyState}><p>No transaction logs found.</p></div>
              ) : (
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Reference / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLogs.map(log => (
                      <tr key={log._id}>
                        <td>{new Date(log.paymentDate).toLocaleDateString()}</td>
                        <td><span className={styles.passBadge}>{log.paymentMethod || 'Cash'}</span></td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 800 }}>₹{log.amountPaid?.toLocaleString() || 0}</td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{log.notes}</td>
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
