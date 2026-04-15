import { api } from '@/lib/axiosInstance';

export interface Driver {
  _id: string;
  driverId: string;
  name: string;
  phone: string;
  address: string;
  assignedBusId?: string | any;
  salary: number;
  photo?: string;
  isActive: boolean;
}

const driverService = {
  getAll: () => api.get('/drivers'),
  getById: (id: string) => api.get(`/drivers/${id}`),
  create: (data: FormData) => api.post('/drivers', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: FormData) => api.put(`/drivers/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/drivers/${id}`),
};

export default driverService;
