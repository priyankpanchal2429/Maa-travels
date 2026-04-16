import { api } from '@/lib/axiosInstance';
import studentService from './studentService';

/**
 * Payment service — read-only endpoints for payment views.
 * Payment mutations (mark as paid) go through studentService.update.
 */
const paymentService = {
  /** Fetch all students with payment-centric data and filters */
  getOverview: (params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => api.get('/payments', { params }),

  /** Fetch dashboard insight aggregations (unpaid, expiring, expired counts) */
  getInsights: () => api.get('/payments/insights'),

  /** Fetch payment history logs for a specific student */
  getHistory: (studentId: string) => api.get(`/payments/${studentId}/history`),

  /** Mark a student's payment as paid via existing student endpoint */
  markAsPaid: (studentId: string) =>
    studentService.update(studentId, (() => {
      const fd = new FormData();
      fd.append('paymentStatus', 'paid');
      return fd;
    })()),
};

export default paymentService;
