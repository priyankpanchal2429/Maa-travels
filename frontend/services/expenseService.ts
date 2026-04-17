import { api } from '@/lib/axiosInstance';

export type ExpenseType = 'daily' | 'maintenance' | 'fuel' | 'other' | 'salary';

export interface Expense {
  _id: string;
  type: ExpenseType;
  amount: number;
  date: string;
  description: string;
  busId?: string | any;
}

const expenseService = {
  getAll: (params?: any) => api.get('/expenses', { params }),
  getById: (id: string) => api.get(`/expenses/${id}`),
  create: (data: Partial<Expense>) => api.post('/expenses', data),
  update: (id: string, data: Partial<Expense>) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export default expenseService;
