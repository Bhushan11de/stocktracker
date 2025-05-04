// frontend/src/services/stockService.js
import axios from '../utils/axios';

const stockService = {
  // Get all stocks
  getAllStocks: async () => {
    try {
      console.log('Making GET request to /stocks');
      const response = await axios.get('/stocks');
      console.log('Response from /stocks:', response.data);
      return response;
    } catch (error) {
      console.error('Error in getAllStocks:', error);
      throw error;
    }
  },

  // Get stock by ID
  getStockById: async (id) => {
    try {
      const response = await axios.get(`/stocks/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching stock with id ${id}:`, error);
      throw error;
    }
  },

  // Search stocks
  searchStocks: async (term) => {
    return axios.get(`/stocks/search?term=${term}`);
  },

  // Add stock to watchlist
  addToWatchlist: async (stockId) => {
    return axios.post(`/stocks/watchlist/${stockId}`);
  },

  // Remove stock from watchlist
  removeFromWatchlist: async (stockId) => {
    return axios.delete(`/stocks/watchlist/${stockId}`);
  },

  // Get user's watchlist
  getWatchlist: async () => {
    return axios.get('/stocks/watchlist');
  }
};

export default stockService;