// src/api/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Update this to your Laravel backend URL

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const fetchUsers = () => api.get('/users');
export const loginUser = (credentials) => api.post('/login', credentials);

export default api;
