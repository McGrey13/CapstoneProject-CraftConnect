// Secure API configuration with httpOnly cookies support
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const secureApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies
  timeout: 10000, // 10 second timeout
});

// Request interceptor for automatic token refresh and CSRF protection
secureApi.interceptors.request.use(
  async (config) => {
    // No need to manually add Authorization header - httpOnly cookies handle this
    
    // Add CSRF token for stateful requests (POST, PUT, DELETE, PATCH)
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      const csrfToken = sessionStorage.getItem('csrf_token');
      if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for automatic token refresh
secureApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await secureApi.post('/auth/refresh-token', {}, {
          withCredentials: true
        });
        
        // Retry original request
        return secureApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default secureApi;
