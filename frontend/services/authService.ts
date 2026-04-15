import { api } from '@/lib/axiosInstance';
import {
  LoginPayload,
  LoginResponse,
  AuthUser,
  CreateUserPayload,
} from '@/types/auth.types';

/** All API calls related to auth and user management */
const authService = {
  // ─── Auth ──────────────────────────────────
  login: (payload: LoginPayload) =>
    api.post<{ data: LoginResponse }>('/auth/login', payload),

  logout: () => api.post('/auth/logout'),

  refresh: () => api.post<{ data: LoginResponse }>('/auth/refresh'),

  getMe: () => api.get<{ data: AuthUser }>('/auth/me'),

  // ─── Password ──────────────────────────────
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { oldPassword, newPassword }),

  forceChangePassword: (newPassword: string) =>
    api.put('/auth/force-change-password', { newPassword }),

  // ─── Admin — User Management ───────────────
  createUser: (payload: CreateUserPayload) =>
    api.post<{ data: { user: AuthUser; tempPassword: string } }>('/auth/admin/users', payload),

  listUsers: () => api.get<{ data: AuthUser[] }>('/auth/admin/users'),

  resetUserPassword: (userId: string, newTempPassword: string) =>
    api.put(`/auth/admin/users/${userId}/reset-password`, { newTempPassword }),

  toggleUserActive: (userId: string) =>
    api.patch<{ data: AuthUser }>(`/auth/admin/users/${userId}/toggle-active`),

  deleteUser: (userId: string) => api.delete(`/auth/admin/users/${userId}`),
};

export default authService;
