// src/api/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Update this to your Laravel backend URL

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

export const fetchUsers = () => api.get('/users');
export const loginUser = (credentials) => api.post('/login', credentials);
export const createStore = (formData, token) => axios.post(
  (import.meta.env.VITE_BACKEND_URL || API_BASE_URL) + '/stores',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: false,
  }
);
export const getMyStore = (token) => axios.get(
  (import.meta.env.VITE_BACKEND_URL || API_BASE_URL) + '/stores/me',
  {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: false,
  }
);

export const approveStore = (storeId, token) => axios.post(
  (import.meta.env.VITE_BACKEND_URL || API_BASE_URL) + `/stores/${storeId}/approve`,
  {},
  {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: false,
  }
);

export const rejectStore = (storeId, token) => axios.post(
  (import.meta.env.VITE_BACKEND_URL || API_BASE_URL) + `/stores/${storeId}/reject`,
  {},
  {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: false,
  }
);

export default api;
