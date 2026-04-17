import { api } from '@/lib/axiosInstance';

export interface AdminProfile {
  _id: string;
  name: string;
  role: string;
  profilePhoto: string;
}

const adminService = {
  getProfile: () => api.get('/admin/profile'),
  updatePhoto: (data: FormData) => api.post('/admin/profile/photo', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  migrateLegacyStudents: () => api.post('/admin/migrate-legacy-students'),
  seedDemoData: () => api.post('/admin/seed-demo'),
};

export default adminService;
