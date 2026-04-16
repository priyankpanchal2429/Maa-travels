import axios from 'axios';

// Get the URL and strip any accidental trailing slashes from the environment variable
const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://maa-travels.onrender.com';
const API_URL = rawUrl.replace(/\/+$/, '');

const COLLEGE_STORAGE_KEY = 'maa-travels-active-college';

/** Shared Axios instance used across all service calls */
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

/**
 * Interceptor: Automatically injects the active collegeId into every
 * outgoing request. Skips the /colleges endpoint itself to avoid circular filtering.
 */
api.interceptors.request.use((config) => {
  // Don't inject collegeId for college CRUD operations
  if (config.url?.startsWith('/colleges')) return config;

  const collegeId = typeof window !== 'undefined' ? localStorage.getItem(COLLEGE_STORAGE_KEY) : null;
  if (collegeId) {
    config.params = { ...config.params, collegeId };
  }
  return config;
});
