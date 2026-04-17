import { api } from '@/lib/axiosInstance';

const alertService = {
  getAlerts: (collegeId?: string) =>
    api.get('/alerts', { params: { collegeId } }),
};

export default alertService;
