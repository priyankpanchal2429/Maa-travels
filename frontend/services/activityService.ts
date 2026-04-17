import { api } from '@/lib/axiosInstance';

export interface ActivityLog {
  _id: string;
  type: 'student' | 'payment' | 'fleet' | 'expense' | 'system';
  message: string;
  timestamp: string;
  metadata?: any;
}

const activityService = {
  getRecent: (limit: number = 20) => api.get(`/activity?limit=${limit}`),
};

export default activityService;
