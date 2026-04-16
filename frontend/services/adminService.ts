import { api } from '@/lib/axiosInstance';

export interface AdminProfile {
  _id: string;
  name: string;
  role: string;
  profilePhoto?: string;
  settings: {
    darkMode: boolean;
    notifications: boolean;
  };
}

const adminService = {
  getProfile: () => api.get('/admin/profile'),
  
  updatePhoto: (formData: FormData) => api.post('/admin/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default adminService;
