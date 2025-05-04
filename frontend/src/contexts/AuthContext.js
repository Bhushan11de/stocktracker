import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

// Create the context with default values
const createDefaultContextValue = () => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  error: null,
  register: () => Promise.resolve(),
  login: () => Promise.resolve(),
  logout: () => {},
  updateProfile: () => Promise.resolve(),
  clearErrors: () => {},
});

// Create the context
export const AuthContext = createContext(createDefaultContextValue());

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token in axios headers whenever token changes
  useEffect(() => {
    console.log('Token changed, setting auth token:', token ? 'exists' : 'none');
    if (token) {
      authService.setAuthToken(token);
    } else {
      authService.removeAuthToken();
    }
  }, [token]);

  // Utility function to handle API calls with proper error handling
  const handleApiCall = useCallback(
    async (apiCall, successMessage, errorPrefix = 'Auth error') => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();

        if (successMessage) {
          toast.success(successMessage);
        }

        setLoading(false);
        return response;
      } catch (err) {
        const errorMessage =
          err.response?.data?.error || err.message || `${errorPrefix}: An unexpected error occurred`;
        const errorDetails = err.response?.data?.details || null;

        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);

        // Include details in the thrown error
        throw { error: errorMessage, details: errorDetails };
      }
    },
    []
  );

  // Load user data if token exists
  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    console.log('Loading user with token:', token.substring(0, 15) + '...');

    try {
      const response = await handleApiCall(
        async () => await authService.getCurrentUser(),
        null,
        'Failed to load user'
      );

      const userData = response.data; // authService.getCurrentUser returns { data: { id, email, role, ... } }
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
      console.log('User loaded successfully:', userData);
    } catch (err) {
      console.error('Error loading user:', err);

      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('Auth token invalid, logging out');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } finally {
      setLoading(false);
    }
  }, [token, handleApiCall]);

  // Load user on mount and token change
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Register user
  const register = useCallback(
    async (userData) => {
      return handleApiCall(
        async () => {
          const response = await authService.register(userData);

          if (response && response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
            await loadUser(); // Load user data after registration
          }

          return response;
        },
        'Registration successful! Logging you in...',
        'Registration failed'
      );
    },
    [handleApiCall, loadUser]
  );

  // Login user
  const login = useCallback(
    async ({ email, password }) => {
      return handleApiCall(
        async () => {
          const response = await authService.login({ email, password });

          if (response && response.token) {
            console.log('Login successful, setting token');
            localStorage.setItem('token', response.token);
            setToken(response.token);
            authService.setAuthToken(response.token);

            const userData = response.user;
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(userData.role === 'admin');
            console.log('User set:', userData);
          }

          return response;
        },
        'Login successful!',
        'Login failed'
      );
    },
    [handleApiCall]
  );

  // Update user profile
  const updateProfile = useCallback(
    async (userData) => {
      return handleApiCall(
        async () => {
          const response = await authService.updateProfile(userData);

          if (response && response.data) {
            setUser((prevUser) => ({ ...prevUser, ...response.data }));
          }

          return response;
        },
        'Profile updated successfully',
        'Profile update failed'
      );
    },
    [handleApiCall]
  );

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    authService.removeAuthToken();
    toast.info('You have been logged out');
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setError(null);
  }, []);

  // Debug: Log authentication state changes
  useEffect(() => {
    console.log('Auth state changed:', {
      isAuthenticated,
      token: token ? 'exists' : 'none',
      user,
      isAdmin,
    });
  }, [isAuthenticated, token, user, isAdmin]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isAdmin,
      loading,
      error,
      register,
      login,
      logout,
      updateProfile,
      clearErrors,
    }),
    [user, token, isAuthenticated, isAdmin, loading, error, register, login, logout, updateProfile, clearErrors]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;