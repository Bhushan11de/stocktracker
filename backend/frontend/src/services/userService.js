// frontend/src/services/userService.js
import axios from '../utils/axios';

const userService = {
  // Get user's portfolio
  getPortfolio: async () => {
    return axios.get('/users/portfolio');
  },

  // Buy stock
  buyStock: async (stockData) => {
    return axios.post('/users/buy', stockData);
  },

  // Sell stock
  sellStock: async (stockData) => {
    return axios.post('/users/sell', stockData);
  },

  // Get user's transactions
  getTransactions: async () => {
    return axios.get('/users/transactions');
  },

  // Get user's dashboard data
  getDashboard: async () => {
    return axios.get('/users/dashboard');
  }
};

export default userService;