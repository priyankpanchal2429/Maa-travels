import { api } from '@/lib/axiosInstance';

export interface Stop {
  name: string;
  order: number;
}

export interface Route {
  _id: string;
  routeName: string;
  stops: Stop[];
  assignedBusId?: string | any;
}

const routeService = {
  getAll: () => api.get('/routes'),
  getById: (id: string) => api.get(`/routes/${id}`),
  create: (data: Partial<Route>) => api.post('/routes', data),
  update: (id: string, data: Partial<Route>) => api.put(`/routes/${id}`, data),
  delete: (id: string) => api.delete(`/routes/${id}`),
};

export default routeService;
