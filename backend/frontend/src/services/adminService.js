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
    return axios.post('/admin/stocks', stockData);
  },

  // Update stock
  updateStock: async (id, stockData) => {
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