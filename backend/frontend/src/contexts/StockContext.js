// frontend/src/contexts/StockContext.js
import React, { createContext, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import stockService from '../services/stockService';
import userService from '../services/userService';
import { AuthContext } from './AuthContext';

export const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    profitLossPercentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all stocks
  const getAllStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await stockService.getAllStocks();
      setStocks(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch stocks');
      setLoading(false);
      toast.error('Failed to fetch stocks');
      throw error;
    }
  };

  // Get stock by ID
  const getStockById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await stockService.getStockById(id);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch stock details');
      setLoading(false);
      toast.error('Failed to fetch stock details');
      throw error;
    }
  };

  // Search stocks
  const searchStocks = async (term) => {
    setLoading(true);
    setError(null);
    try {
      const response = await stockService.searchStocks(term);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to search stocks');
      setLoading(false);
      toast.error('Failed to search stocks');
      throw error;
    }
  };

  // Add stock to watchlist
  const addToWatchlist = async (stockId) => {
    if (!token) {
      toast.error('Please login to add to watchlist');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await stockService.addToWatchlist(stockId);
      // Refresh watchlist
      await getUserWatchlist();
      setLoading(false);
      toast.success('Stock added to watchlist');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add to watchlist');
      setLoading(false);
      toast.error(error.response?.data?.error || 'Failed to add to watchlist');
      throw error;
    }
  };

  // Remove stock from watchlist
  const removeFromWatchlist = async (stockId) => {
    if (!token) {
      toast.error('Please login to manage your watchlist');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await stockService.removeFromWatchlist(stockId);
      // Update watchlist state
      setWatchlist(watchlist.filter(item => item.stock_id !== stockId));
      setLoading(false);
      toast.success('Stock removed from watchlist');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to remove from watchlist');
      setLoading(false);
      toast.error('Failed to remove from watchlist');
      throw error;
    }
  };

  // Get user's watchlist
  const getUserWatchlist = async () => {
    if (!token) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await stockService.getWatchlist();
      setWatchlist(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch watchlist');
      setLoading(false);
      console.error('Failed to fetch watchlist', error);
      return [];
    }
  };

  // Buy stock
  const buyStock = async (stockId, quantity, price) => {
    if (!token) {
      toast.error('Please login to buy stocks');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await userService.buyStock({
        stockId,
        quantity,
        price
      });
      // Refresh portfolio
      await getUserPortfolio();
      setLoading(false);
      toast.success('Stock purchased successfully');
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to buy stock');
      setLoading(false);
      toast.error(error.response?.data?.error || 'Failed to buy stock');
      throw error;
    }
  };

  // Sell stock
  const sellStock = async (stockId, quantity, price) => {
    if (!token) {
      toast.error('Please login to sell stocks');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await userService.sellStock({
        stockId,
        quantity,
        price
      });
      // Refresh portfolio
      await getUserPortfolio();
      setLoading(false);
      toast.success('Stock sold successfully');
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to sell stock');
      setLoading(false);
      toast.error(error.response?.data?.error || 'Failed to sell stock');
      throw error;
    }
  };

  // Get user's portfolio
  const getUserPortfolio = async () => {
    if (!token) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getPortfolio();
      setPortfolio(response.data.portfolio);
      setPortfolioSummary(response.data.summary);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch portfolio');
      setLoading(false);
      console.error('Failed to fetch portfolio', error);
      return { portfolio: [], summary: {} };
    }
  };

  // Get user's transactions
  const getUserTransactions = async () => {
    if (!token) {
      return [];
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getTransactions();
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch transactions');
      setLoading(false);
      console.error('Failed to fetch transactions', error);
      return [];
    }
  };

  return (
    <StockContext.Provider
      value={{
        stocks,
        watchlist,
        portfolio,
        portfolioSummary,
        loading,
        error,
        getAllStocks,
        getStockById,
        searchStocks,
        addToWatchlist,
        removeFromWatchlist,
        getUserWatchlist,
        buyStock,
        sellStock,
        getUserPortfolio,
        getUserTransactions
      }}
    >
      {children}
    </StockContext.Provider>
  );
};