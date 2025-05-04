// frontend/src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add authorization token
instance.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Using auth token:', token.substring(0, 15) + '...');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response.data;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Extract the error message from the response when possible
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      console.log('Error response data:', error.response.data);
      errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      
      // Handle token expiration
      if (error.response.status === 401) {
        // Clear token if it's invalid
        if (localStorage.getItem('token')) {
          console.log('Clearing invalid token');
          localStorage.removeItem('token');
          // Reload the page to reset app state
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.log('Error request:', error.request);
      errorMessage = 'No response received from server';
    } else {
      console.log('Error message:', error.message);
      errorMessage = error.message;
    }
    
    // Add the error message to the error object
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

export default instance;