// frontend/src/utils/axios.js
import axios from 'axios';

// Create axios instance with base URL - Using correct port 5001
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Initialize auth token from localStorage (on initial load)
const token = localStorage.getItem('token');
if (token) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Initialized axios with token from localStorage');
}

// Add request interceptor for logging and adding token
instance.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    
    // Log auth header for debugging
    console.log('Request has auth header:', 
      config.headers?.Authorization ? 'Yes' : 'No');
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and logging
instance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Handle error safely
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.config?.url);
      console.error('Error data:', error.response.data);

      // Handle token expiration
      if (error.response.status === 401) {
        console.log('Received 401 Unauthorized, checking if token related');
        
        // Check if the error message indicates token issues
        const errorMsg = error.response.data?.message || error.response.data?.error || '';
        if (errorMsg.toLowerCase().includes('token') || 
            errorMsg.toLowerCase().includes('auth') || 
            errorMsg.includes('Not authorized')) {
          
          console.log('Token appears invalid, clearing from localStorage');
          localStorage.removeItem('token');
          
          // Redirect to login page (if not already there)
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('API Error: No response received', error.config?.url);
    } else {
      // Error in setting up request
      console.error('API Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;