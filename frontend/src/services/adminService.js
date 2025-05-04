// frontend/src/services/adminService.js
import axios from '../utils/axios';

const adminService = {
  // Get all users
  getUsers: async () => {
    return axios.get('/admin/users');
  },

  // Get user by ID
  getUserById: async (id) => {
    return axios.get(`/admin/users/${id}`);
  },

  // Add new stock
  addStock: async (stockData) => {
    // Validate that current_price exists and is a number
    if (!stockData.current_price && stockData.current_price !== 0) {
      console.error('Missing required field: current_price', stockData);
      throw new Error('Current price is required');
    }

    // Ensure current_price is a number
    if (typeof stockData.current_price !== 'number') {
      stockData.current_price = parseFloat(stockData.current_price);
      
      if (isNaN(stockData.current_price)) {
        throw new Error('Current price must be a valid number');
      }
    }
    
    // Log what's being sent to the API
    console.log('Sending to API:', stockData);
    
    return axios.post('/admin/stocks', stockData);
  },

  // Update stock
  updateStock: async (id, stockData) => {
    // Similar validation for updates
    if (stockData.current_price !== undefined) {
      if (typeof stockData.current_price !== 'number') {
        stockData.current_price = parseFloat(stockData.current_price);
        
        if (isNaN(stockData.current_price)) {
          throw new Error('Current price must be a valid number');
        }
      }
    }
    
    return axios.put(`/admin/stocks/${id}`, stockData);
  },

  // Delete stock
  deleteStock: async (id) => {
    return axios.delete(`/admin/stocks/${id}`);
  },

  // Get all transactions
  getAllTransactions: async () => {
    return axios.get('/admin/transactions');
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    return axios.get('/admin/dashboard');
  }
};

export default adminService;