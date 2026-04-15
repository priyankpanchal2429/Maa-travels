import { api } from '@/lib/axiosInstance';

export type BusStatus = 'idle' | 'running' | 'maintenance';

export interface Bus {
  _id: string;
  busNumber: string;
  plateNumber: string;
  capacity: number;
  status: BusStatus;
  currentDriverId?: string | any;
}

const busService = {
  getAll: () => api.get('/buses'),
  getById: (id: string) => api.get(`/buses/${id}`),
  create: (data: Partial<Bus>) => api.post('/buses', data),
  update: (id: string, data: Partial<Bus>) => api.put(`/buses/${id}`, data),
  delete: (id: string) => api.delete(`/buses/${id}`),
};

export default busService;
