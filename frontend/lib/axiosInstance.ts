import axios from 'axios';

// Get the URL and strip any accidental trailing slashes from the environment variable
const rawUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001';
const API_URL = rawUrl.replace(/\/+$/, '');

/** Shared Axios instance used across all service calls */
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});
