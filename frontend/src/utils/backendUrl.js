/**
 * Get the backend URL based on environment
 * Works for both local development and production
 */
export const getBackendUrl = () => {
  // Check if we're in local development
  const isLocalDev = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname === '::1');

  // If local development, use localhost
  if (isLocalDev) {
    return 'http://localhost:8000';
  }

  // In production, use VITE_BACKEND_URL or default to production URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://capstoneproject-craftconnect.onrender.com';
  
  // Remove /api suffix if present
  return backendUrl.replace(/\/api\/?$/i, '');
};

/**
 * Get the storage URL for images/files
 */
export const getStorageUrl = (path) => {
  if (!path) return '';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${getBackendUrl()}/storage/${cleanPath}`;
};

/**
 * Get the image URL (for /images route)
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${getBackendUrl()}/images/${cleanPath}`;
};























