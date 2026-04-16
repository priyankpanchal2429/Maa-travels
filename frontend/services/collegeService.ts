import { api } from '@/lib/axiosInstance';

export interface College {
  _id: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
}

const collegeService = {
  getAll: () => api.get('/colleges'),
  getById: (id: string) => api.get(`/colleges/${id}`),
  create: (data: Partial<College>) => api.post('/colleges', data),
  update: (id: string, data: Partial<College>) => api.put(`/colleges/${id}`, data),
  delete: (id: string) => api.delete(`/colleges/${id}`),
};

export default collegeService;
