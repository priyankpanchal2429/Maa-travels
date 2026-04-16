import { api } from '@/lib/axiosInstance';

export type SubscriptionDuration = '6m' | '1y';
export type PaymentStatus = 'paid' | 'unpaid' | 'bypassed';

export interface Student {
  _id: string;
  studentId: string;
  name: string;
  parentPhone: string;
  address: string;
  duration: SubscriptionDuration;
  routeId: string | any;
  stopId: string;
  paymentStatus: PaymentStatus;
  expiryDate: string;
  photo?: string;
  isActive: boolean;
}

const studentService = {
  getAll: () => api.get('/students'),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: FormData) => api.post('/students', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: FormData) => api.put(`/students/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export default studentService;
