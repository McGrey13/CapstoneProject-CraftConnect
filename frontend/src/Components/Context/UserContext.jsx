import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api, { setToken, getToken, rootApi } from '../../api';
import { Clock, LogIn } from 'lucide-react';
import { getStorageUrl } from '../../utils/backendUrl';

const UserContext = createContext();

// Flag to track if CSRF has been initialized (outside component to persist across re-mounts)
let csrfInitialized = false;

const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour
const SESSION_CHECK_INTERVAL_MS = 15 * 1000; // check every 15 seconds

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to restore user from localStorage on mount
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const sessionExpiryHandledRef = useRef(false);
  const sessionIntervalRef = useRef(null);

  const clearStoredAuthState = () => {
    setUser(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('session_start_time');
    setToken(null);
  };

  const resetSessionTimer = () => {
    sessionExpiryHandledRef.current = false;
    localStorage.setItem('session_start_time', Date.now().toString());
  };

  const ensureSessionTimer = () => {
    const stored = Number(localStorage.getItem('session_start_time'));
    if (!stored || Number.isNaN(stored)) {
      resetSessionTimer();
      return Date.now();
    }
    return stored;
  };

  const handleSessionExpiry = async () => {
    if (sessionExpiryHandledRef.current) {
      return;
    }

    sessionExpiryHandledRef.current = true;
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }

    setSessionModalVisible(true);

    try {
      await logout({ preserveSessionModal: true, skipSessionReset: true });
    } catch (error) {
      console.error('Session expiry logout error:', error);
      clearStoredAuthState();
    }
  };

  // Check if user is authenticated on app load
  const checkAuthStatus = async () => {
    if (isCheckingAuth) {
      return; // Prevent multiple simultaneous auth checks
    }
    
    setIsCheckingAuth(true);
    console.log('🔍 Checking authentication status...');
    
    // First check if we have a saved user in localStorage
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('📦 Found saved user data:', userData);
        
        // Ensure profile picture URL is properly constructed
        if (userData.profilePicture && !userData.profilePicture.startsWith('http')) {
          userData.profilePicture = getStorageUrl(userData.profilePicture);
        }
        
        setUser(userData);
        ensureSessionTimer();
        setSessionModalVisible(false);
        sessionExpiryHandledRef.current = false;
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
        localStorage.removeItem('user_data');
      }
    }
    
    // If we have neither a saved user nor a bearer token, skip calling profile
    // This avoids unnecessary 401s before login
    const hasBearerToken = !!getToken();
    if (!savedUser && !hasBearerToken) {
      setLoading(false);
      setIsCheckingAuth(false);
      return;
    }

    try {
      // Verify with backend - cookies are automatically sent with withCredentials: true
      const response = await api.get('/auth/profile', {
        withCredentials: true
      });
      console.log('✅ Authentication successful:', response.data);
      
      // Construct full profile picture URL if it exists
      const userData = { ...response.data };
      if (userData.profilePicture && !userData.profilePicture.startsWith('http')) {
        userData.profilePicture = getStorageUrl(userData.profilePicture);
      }
      
      // Save user data to localStorage for persistence
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      ensureSessionTimer();
      setSessionModalVisible(false);
      sessionExpiryHandledRef.current = false;
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      
      // Only clear user if we get a definite 401 (Unauthorized) AND we don't have a saved user
      if (error.response?.status === 401) {
        console.log('🚫 401 Unauthorized - clearing stored authentication data');
        clearStoredAuthState();
      } else {
        // For network errors or other issues, keep the saved user
        console.log('⚠️ Network/Server error, keeping saved user if exists');
        if (!savedUser) {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
      setIsCheckingAuth(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      // Clear any existing auth data
      localStorage.removeItem('user_data');
      sessionStorage.clear();
      
      const response = await api.post('/auth/login', credentials, {
        withCredentials: true
      });
      const { user: userData, userType, redirectTo, expires_at, token } = response.data;
      
      // For cookie-based auth, we don't need to manually set tokens
      // The backend sets httpOnly cookies automatically
      // Only set token if provided (for backward compatibility)
      if (token) {
        setToken(token);
      }
      
      // Construct full profile picture URL if it exists
      if (userData.profilePicture && !userData.profilePicture.startsWith('http')) {
        userData.profilePicture = getStorageUrl(userData.profilePicture);
      }
      
      // Save user data to localStorage for persistence across reloads
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      resetSessionTimer();
      setSessionModalVisible(false);
      
      console.log('✅ Login successful, user data saved:', userData);
      
      return { success: true, userType: userType, redirectTo: redirectTo, expires_at: expires_at };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async (options = {}) => {
    const {
      preserveSessionModal = false,
      skipSessionReset = false,
    } = options;

    try {
      // Call logout endpoint - cookies will be cleared automatically
      await api.post('/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state and all stored data
      clearStoredAuthState();
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear CSRF token
      sessionStorage.removeItem('csrf_token');
      
      console.log('✅ User logged out successfully - all auth data cleared');

      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
        sessionIntervalRef.current = null;
      }

      if (!skipSessionReset) {
        sessionExpiryHandledRef.current = false;
      }

      if (!preserveSessionModal) {
        setSessionModalVisible(false);
      }
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration with data:', userData);
      
      const response = await api.post('/auth/register', userData, {
        withCredentials: true
      });
      
      console.log('✅ Registration successful:', response.data);
      
      // For OTP flow, just return the success response
      // Tokens will be set in httpOnly cookies after OTP verification
      return { ...response.data, success: true };
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  };

  // Verify OTP function
  const verifyOtp = async (otpData) => {
    try {
      const response = await api.post('/auth/verify-otp', otpData, {
        withCredentials: true
      });
      const { user: userData, expires_at, token } = response.data;
      
      // For cookie-based auth, we don't need to manually set tokens
      // The backend sets httpOnly cookies automatically
      // Only set token if provided (for backward compatibility)
      if (token) {
        setToken(token);
      }
      
      // Construct full profile picture URL if it exists
      if (userData.profilePicture && !userData.profilePicture.startsWith('http')) {
        userData.profilePicture = getStorageUrl(userData.profilePicture);
      }
      
      // Save user data to localStorage for persistence
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      resetSessionTimer();
      setSessionModalVisible(false);
      
      console.log('✅ OTP verified, user data saved:', userData);
      
      return { ...response.data, success: true, expires_at: expires_at };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    // Also update localStorage when user data changes
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  };

  useEffect(() => {
    // Initialize CSRF token and check auth status
    const initializeAuth = async () => {
      try {
        // Only initialize CSRF once per session
        if (!csrfInitialized) {
          console.log('🔐 Initializing CSRF token...');
          // Use rootApi for CSRF cookie endpoint (it's at root, not under /api)
          const response = await rootApi.get('/sanctum/csrf-cookie', {
            withCredentials: true
          });
          
          // CSRF cookie endpoint returns 204 No Content, so no data to check
          // The cookie is set automatically by the browser
          console.log('✅ CSRF cookie set successfully');
          
          csrfInitialized = true;
          console.log('✅ CSRF initialization complete');
        } else {
          console.log('ℹ️ CSRF already initialized, skipping...');
        }
        
        // Check authentication status
        await checkAuthStatus();
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        // Reset flag on error so it can retry later
        if (error.response?.status === 429) {
          console.warn('⚠️ Rate limit hit - will retry on next mount');
        } else {
          csrfInitialized = false; // Allow retry for non-rate-limit errors
        }
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
        sessionIntervalRef.current = null;
      }
      return;
    }

    ensureSessionTimer();

    const checkSession = () => {
      const stored = Number(localStorage.getItem('session_start_time'));
      if (!stored || Number.isNaN(stored)) {
        resetSessionTimer();
        return;
      }

      const elapsed = Date.now() - stored;
      if (elapsed >= SESSION_DURATION_MS) {
        handleSessionExpiry();
      }
    };

    checkSession();
    sessionIntervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL_MS);

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
        sessionIntervalRef.current = null;
      }
    };
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    verifyOtp,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
      <SessionExpiryModal
        open={sessionModalVisible}
        onClose={() => setSessionModalVisible(false)}
        onLogin={() => {
          setSessionModalVisible(false);
          window.location.href = '/login?session=expired';
        }}
      />
    </UserContext.Provider>
  );
};

const SessionExpiryModal = ({ open, onClose, onLogin }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#d5bfae] bg-white p-8 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#e6dcd4] bg-[#f7f1ec] shadow-inner">
          <Clock className="h-8 w-8 text-[#a4785a]" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-semibold text-[#5c3d28]">
          Session expired
        </h2>
        <p className="mt-3 text-center text-sm text-[#7b5a3b] leading-relaxed">
          For your security, we signed you out after one hour of activity. Please log in again to continue where you left off.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border-2 border-[#d5bfae] px-4 py-3 text-[#5c3d28] transition hover:bg-[#f4ece6]"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] px-4 py-3 font-semibold text-white shadow-md transition hover:from-[#8f674a] hover:to-[#6a4c34] hover:shadow-lg"
          >
            <LogIn className="h-4 w-4" />
            Log in again
          </button>
        </div>
      </div>
    </div>
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
