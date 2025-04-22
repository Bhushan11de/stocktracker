// frontend/src/services/authService.js
import axios from '../utils/axios';

const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      console.log('Attempting registration with:', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      const response = await axios.post('/auth/register', userData);
      console.log('Registration response:', response);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Login a user
  login: async (userData) => {
    try {
      console.log('Attempting login with:', userData.email);
      const response = await axios.post('/auth/login', userData);
      console.log('Login response:', response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get current user
  getMe: async () => {
    try {
      const response = await axios.get('/auth/me');
      console.log('getMe response:', response);
      return response.data;
    } catch (error) {
      console.error('getMe error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await axios.put(`/auth/reset-password/${token}`, { password });
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update password
  updatePassword: async (passwordData) => {
    try {
      const response = await axios.put('/auth/update-password', passwordData);
      return response;
    } catch (error) {
      console.error('Update password error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }
};

export default authService;