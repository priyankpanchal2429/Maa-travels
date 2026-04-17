import api from './api';

const alertService = {
  getAlerts: (collegeId?: string) =>
    api.get('/alerts', { params: { collegeId } }),
};

export default alertService;
