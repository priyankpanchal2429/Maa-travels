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

  /** Mark a student's payment as paid via specialized transactional endpoint */
  markAsPaid: (studentId: string, data?: { paymentMethod: string; notes?: string }) =>
    api.post(`/payments/${studentId}/record`, data),
};

export default paymentService;
