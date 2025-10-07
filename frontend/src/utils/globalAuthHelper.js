// Global Authentication Helper
// This file provides utilities for managing authentication across the entire application

import { setToken, getToken } from '../api';

export const setGlobalAuthToken = (token) => {
  // Set token in sessionStorage to match main API configuration
  sessionStorage.setItem('auth_token', token);
  // Also update the API defaults
  setToken(token);
  console.log('🔑 Global authentication token set');
};

export const getGlobalAuthToken = () => {
  // Check both sessionStorage and the API getToken function
  const token = sessionStorage.getItem('auth_token') || getToken();
  if (!token) {
    console.warn('⚠️ No global authentication token found');
  }
  return token;
};

export const clearGlobalAuthToken = () => {
  sessionStorage.removeItem('auth_token');
  localStorage.removeItem('token'); // Clear any localStorage tokens too
  setToken(null); // Clear API defaults
  console.log('🗑️ Global authentication token cleared');
};

export const isGloballyAuthenticated = () => {
  const token = getGlobalAuthToken();
  return !!token;
};

// Test authentication with a specific endpoint
export const testGlobalAuthentication = async (endpoint = '/auth/profile') => {
  const token = getGlobalAuthToken();
  
  if (!token) {
    console.error('❌ No global token available for testing');
    return false;
  }

  try {
    const response = await fetch(`http://localhost:8000/api${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include'
    });

    if (response.status === 200) {
      console.log('✅ Global authentication test successful!');
      return true;
    } else if (response.status === 401) {
      console.error('❌ Global authentication failed - token expired or invalid');
      return false;
    } else {
      console.error(`❌ Global authentication test failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Global authentication test error:', error);
    return false;
  }
};

// Setup test authentication for development
export const setupTestGlobalAuth = () => {
  // Use the latest token from our test (Alex Manalo's Shop - User ID 4)
  const testToken = '38|LjCfchmIHZSWh8NSd4IVrAKJlkfhlbq4QttMi4mT2eac6453';
  setGlobalAuthToken(testToken);
  console.log('🚀 Test global authentication token set!');
  console.log('💡 This token works for both seller and admin endpoints');
  
  // Test the authentication
  testGlobalAuthentication().then(success => {
    if (success) {
      console.log('🎉 Global authentication is working! All protected endpoints should work now.');
    } else {
      console.log('⚠️ Global authentication test failed. Please check your setup.');
    }
  });
};

// Quick authentication setup for seller components
export const setupSellerAuth = () => {
  setupTestGlobalAuth();
  console.log('🔧 Seller authentication setup complete!');
};

// Quick authentication setup for admin components  
export const setupAdminAuth = () => {
  setupTestGlobalAuth();
  console.log('🔧 Admin authentication setup complete!');
};

// Auto-setup for development (uncomment the line below to auto-set the test token)
// setupTestGlobalAuth();
