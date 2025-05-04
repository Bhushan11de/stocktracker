// frontend/src/services/userService.js
import axios from '../utils/axios';

// Simple cache for performance optimization
const cache = {};

const userService = {
  // Get user's portfolio
  getPortfolio: async () => {
    // Check if we have cached data that's less than 30 seconds old
    if (cache.portfolio && (Date.now() - cache.portfolio.timestamp < 30000)) {
      return cache.portfolio.data;
    }
    
    try {
      const response = await axios.get('/users/portfolio');
      
      // Cache the result
      cache.portfolio = {
        data: response,
        timestamp: Date.now()
      };
      
      return response;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },

  // Buy stock
  buyStock: async (stockData) => {
    try {
      console.log('Buying stock with data:', stockData);
      // Ensure stockId is properly formatted
      const buyData = {
        stockId: parseInt(stockData.stockId) || stockData.stockId,
        quantity: parseInt(stockData.quantity),
        price: parseFloat(stockData.price)
      };
      
      const response = await axios.post('/users/buy', buyData);
      
      // Invalidate cache since data has changed
      delete cache.portfolio;
      delete cache.dashboard;
      delete cache.transactions;
      
      return response;
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  },

  // Sell stock
  sellStock: async (stockData) => {
    try {
      // Ensure stockId is properly formatted
      const sellData = {
        stockId: parseInt(stockData.stockId) || stockData.stockId,
        quantity: parseInt(stockData.quantity),
        price: parseFloat(stockData.price)
      };
      
      const response = await axios.post('/users/sell', sellData);
      
      // Invalidate cache since data has changed
      delete cache.portfolio;
      delete cache.dashboard;
      delete cache.transactions;
      
      return response;
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  },

  // Get user's transactions
  getTransactions: async () => {
    // Check if we have cached data
    if (cache.transactions && (Date.now() - cache.transactions.timestamp < 30000)) {
      return cache.transactions.data;
    }
    
    try {
      const response = await axios.get('/users/transactions');
      
      cache.transactions = {
        data: response,
        timestamp: Date.now()
      };
      
      return response;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get user's dashboard data
  getDashboard: async () => {
    // Check if we have cached data
    if (cache.dashboard && (Date.now() - cache.dashboard.timestamp < 30000)) {
      return cache.dashboard.data;
    }
    
    try {
      const response = await axios.get('/users/dashboard');
      
      cache.dashboard = {
        data: response,
        timestamp: Date.now()
      };
      
      return response;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },
  
  // Method to manually clear cache if needed
  clearCache: () => {
    Object.keys(cache).forEach(key => delete cache[key]);
  }
};

export default userService;