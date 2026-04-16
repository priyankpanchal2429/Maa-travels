import { api } from '@/lib/axiosInstance';

const adminService = {
  getProfile: () => api.get('/admin/profile'),
  updatePhoto: (data: FormData) => api.post('/admin/profile/photo', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  migrateLegacyStudents: () => api.post('/admin/migrate-legacy-students'),
};

export default adminService;
