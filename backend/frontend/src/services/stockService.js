// frontend/src/services/stockService.js
import axios from '../utils/axios';

const stockService = {
  // Get all stocks
  getAllStocks: async () => {
    return axios.get('/stocks');
  },

  // Get stock by ID
  getStockById: async (id) => {
    return axios.get(`/stocks/${id}`);
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