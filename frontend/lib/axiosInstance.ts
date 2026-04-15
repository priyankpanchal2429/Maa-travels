import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

/** Shared Axios instance used across all service calls */
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // sends httpOnly refresh token cookie automatically
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — Render free tier needs 30-60s to wake from sleep
});

// ─── Request interceptor ─────────────────────
// Attaches the current access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ────────────────────
// On 401 → silently refresh the access token and retry the original request once
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (err: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)));
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only retry on 401, and not for the /refresh route itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue concurrent requests until refresh completes
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
        const newToken = data.data.accessToken;
        tokenStore.set(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        // Let AuthContext handle the redirect
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
