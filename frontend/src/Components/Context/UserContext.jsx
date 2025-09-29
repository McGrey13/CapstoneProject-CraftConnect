import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Set the token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user profile
      const response = await api.get('/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Authentication check failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth-token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  // Login function
const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    const { token, user: userData, userType, redirectTo } = response.data;
    
    localStorage.setItem('auth-token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    
    return { success: true, userType: userType, redirectTo: redirectTo }; // ✅ normalize
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      const token = localStorage.getItem('auth-token');
      if (token) {
        await api.post('/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('auth-token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      
      // The backend returns the user data directly in the response
      // We'll store the token if it's provided, but don't expect it for OTP flow
      if (response.data.token) {
        localStorage.setItem('auth-token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        return { ...response.data, success: true };
      }
      
      // For OTP flow, just return the success response
      return { ...response.data, success: true };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { UserContext };
