import { api } from '@/lib/axiosInstance';

export interface DashboardOverview {
  counts: {
    students: number;
    buses: {
      total: number;
      active: number;
      maintenance: number;
    };
    drivers: number;
    routes: number;
  };
  expenses: {
    total: number;
    recent: any[];
  };
}

const dashboardService = {
  getOverview: (collegeId?: string) => 
    api.get('/dashboard/nexus', { params: { collegeId } }),
  getAnalytics: (collegeId?: string) =>
    api.get('/dashboard/analytics', { params: { collegeId } }),
};

export default dashboardService;
