// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Load user data if token exists
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(userData.role === 'admin');
          console.log('User loaded:', userData); // Debug log
          console.log('Is admin:', userData.role === 'admin'); // Debug log
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setLoading(false);
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (formData) => {
    try {
      const response = await authService.register(formData);
      
      // Save token and set user data
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.data);
      setIsAuthenticated(true);
      setIsAdmin(response.data.role === 'admin');
      
      toast.success('Registration successful!');
      return response;
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Registration failed. Please try again.'
      );
      throw error;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      // For testing purposes, handle admin login separately
      if (formData.isAdmin) {
        // Demo admin login
        const adminCredentials = {
          email: 'admin@example.com',
          password: formData.password
        };
        
        // Try to log in with admin credentials
        try {
          const response = await authService.login(adminCredentials);
          
          // Check if the user is actually an admin
          if (response.data.role !== 'admin') {
            throw new Error('This account does not have administrator privileges');
          }
          
          // Save token and set user data
          localStorage.setItem('token', response.token);
          setToken(response.token);
          setUser(response.data);
          setIsAuthenticated(true);
          setIsAdmin(true);
          
          console.log('Admin login successful, user data:', response.data); // Debug log
          
          return response;
        } catch (error) {
          console.error('Admin login failed:', error);
          throw new Error('Invalid admin credentials');
        }
      } else {
        // Regular user login
        const response = await authService.login({
          email: formData.email,
          password: formData.password
        });
        
        // Save token and set user data
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.data);
        setIsAuthenticated(true);
        setIsAdmin(response.data.role === 'admin');
        
        console.log('Regular login successful, user data:', response.data); // Debug log
        
        return response;
      }
    } catch (error) {
      toast.error(
        error.message || 'Login failed. Please check your credentials.'
      );
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    toast.info('You have been logged out');
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Failed to send reset email. Please try again.'
      );
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      await authService.resetPassword(token, password);
      toast.success('Password has been reset successfully. Please login with your new password.');
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Failed to reset password. Please try again.'
      );
      throw error;
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      const response = await authService.updatePassword(passwordData);
      
      // Update token
      localStorage.setItem('token', response.token);
      setToken(response.token);
      
      toast.success('Password updated successfully.');
      return response;
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Failed to update password. Please try again.'
      );
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};