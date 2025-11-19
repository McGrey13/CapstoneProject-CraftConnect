// src/api/api.js
import axios from 'axios';

const API_BASE_URL = '/api';

const TOKEN_STORAGE_KEY = 'auth_token';

// Normalize backend URL: if the provided VITE_BACKEND_URL ends with '/api',
// strip the '/api' so we can handle both root endpoints (like CSRF cookie) and API routes
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || '';
const normalizedBackendUrl = rawBackendUrl.replace(/\/api\/?$/i, '').replace(/\/$/, '');

// Base URL for API routes (always includes /api)
// In production (Render), use the full backend URL with /api
// In local development, use relative path /api (which will be proxied by Vite)
const apiBaseUrl = normalizedBackendUrl 
  ? `${normalizedBackendUrl}/api` 
  : API_BASE_URL;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Enable cookies for authentication
});

// Separate axios instance for root-level endpoints like CSRF cookie
// In production, use the full backend URL without /api
// In local development, use the backend URL directly
const rootApi = axios.create({
  baseURL: normalizedBackendUrl || (import.meta.env.DEV ? 'http://localhost:8000' : ''),
  timeout: 30000,
  withCredentials: true,
});

// Token management functions
const getToken = () => {
  const sessionToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (sessionToken) {
    return sessionToken;
  }

  const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (localToken) {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, localToken);
    return localToken;
  }

  return null;
};

const setToken = (token, { persistToLocalStorage = true } = {}) => {
  if (token) {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (persistToLocalStorage) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize token on app load
const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Export token functions for use in other components
export { getToken, setToken };

// Request interceptor - for cookie-based auth with CSRF protection
api.interceptors.request.use(
  async (config) => {
    // For cookie-based authentication, we don't need to manually add Authorization header
    // The httpOnly cookies are automatically sent with withCredentials: true
    // Only add token if it exists (for backward compatibility)
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Content-Type based on data type
    if (config.data instanceof FormData) {
      // Don't set Content-Type for FormData - let axios set it automatically
      // This ensures multipart/form-data is used with proper boundary
      delete config.headers['Content-Type'];
    } else if (config.data && typeof config.data === 'object') {
      // For JSON requests, set Content-Type
      config.headers['Content-Type'] = 'application/json';
    }

    // Add CSRF token for stateful requests (POST, PUT, DELETE, PATCH)
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      // For now, we'll handle CSRF tokens in the UserContext
      // This avoids circular dependency issues
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

// Global refresh promise to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

  // If token expired and we haven't already tried to refresh
  if (error.response?.status === 401 && !originalRequest._retry) {
    // Gate refresh to bearer-token flow only; cookie-based auth should use secureApi
    const existingToken = getToken();
    if (!existingToken) {
      return Promise.reject(error);
    }
      // Prevent infinite refresh loops
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.log('Too many refresh attempts, clearing auth and redirecting to login');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;

      try {
        // Attempt to refresh token
        const refreshResponse = await api.post('/auth/refresh-token', {}, {
          withCredentials: true
        });
        const newToken = refreshResponse.data.token || refreshResponse.data.access_token;
        
        if (newToken) {
          setToken(newToken);
          processQueue(null, newToken);
          refreshAttempts = 0; // Reset on success
          
          // Retry original request
          return api(originalRequest);
        } else {
          // For cookie-based auth, we might not get a token in response
          // The cookies are automatically updated by the backend
          processQueue(null, 'cookie-refresh');
          refreshAttempts = 0; // Reset on success
          
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed, redirect to login
        console.log('Token refresh failed, redirecting to login');
        setToken(null); // Clear token
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const fetchUsers = () => api.get('/users');
export const loginUser = (credentials) => api.post('/auth/login', credentials); // Use secure endpoint

// Export rootApi for root-level endpoints like CSRF cookie
export { rootApi };

export default api;
