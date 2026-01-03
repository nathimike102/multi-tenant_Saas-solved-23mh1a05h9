import axios from 'axios';
import { getToken, clearAuth } from '../auth/storage.js';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearAuth();
      // Optionally redirect on 401 in a global handler
    }
    return Promise.reject(err);
  }
);

export default client;
