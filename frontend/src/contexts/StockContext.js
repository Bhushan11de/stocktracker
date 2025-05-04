// frontend/src/contexts/StockContext.js
import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import stockService from '../services/stockService';
import userService from '../services/userService';
import { useAuth } from './AuthContext';

// Create the context with a function to return default values
const createDefaultContextValue = () => ({
  stocks: [],
  watchlist: [],
  portfolio: [],
  portfolioSummary: {
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    profitLossPercentage: 0
  },
  loading: false,
  error: null,
  getAllStocks: () => Promise.resolve([]),
  getStockById: () => Promise.resolve(null),
  searchStocks: () => Promise.resolve([]),
  addToWatchlist: () => Promise.resolve(null),
  removeFromWatchlist: () => Promise.resolve(null),
  getUserWatchlist: () => Promise.resolve([]),
  buyStock: () => Promise.resolve(null),
  sellStock: () => Promise.resolve(null),
  getUserPortfolio: () => Promise.resolve(null),
  getUserTransactions: () => Promise.resolve([])
});

// Create the context
export const StockContext = createContext(createDefaultContextValue());

// Custom hook to use StockContext
export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
};

// Provider component
export const StockProvider = ({ children }) => {
  const { token } = useAuth();
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

  // Utility function to handle loading state and errors
  const handleApiCall = useCallback(async (apiCall, successMessage) => {
    if (!token) {
      toast.error('Please login to perform this action');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      setLoading(false);
      if (successMessage) toast.success(successMessage);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
      throw error;
    }
  }, [token]);

  // Define getUserPortfolio first since it's referenced in other functions
  const getUserPortfolio = useCallback(async () => {
    return handleApiCall(
      async () => {
        try {
          const response = await userService.getPortfolio();
          const data = response.data;
          
          // Handle different response structures
          const portfolioData = data && data.data && data.data.portfolio 
            ? data.data.portfolio 
            : (data && data.portfolio 
                ? data.portfolio 
                : []);
                
          const summaryData = data && data.data && data.data.summary 
            ? data.data.summary 
            : (data && data.summary 
                ? data.summary 
                : {
                    totalValue: 0,
                    totalCost: 0,
                    totalProfitLoss: 0,
                    profitLossPercentage: 0
                  });
          
          console.log('Portfolio data retrieved:', portfolioData);
          console.log('Summary data retrieved:', summaryData);
          
          setPortfolio(portfolioData);
          setPortfolioSummary(summaryData);
          return { portfolio: portfolioData, summary: summaryData };
        } catch (error) {
          console.error('Error in getUserPortfolio:', error);
          throw error;
        }
      },
      null
    );
  }, [handleApiCall]);

  // Get all stocks
  const getAllStocks = useCallback(async () => {
    return handleApiCall(
      async () => {
        try {
          const response = await stockService.getAllStocks();
          // Check for the correct data structure and extract the stocks
          const stocksData = response.data && response.data.data 
            ? response.data.data 
            : (Array.isArray(response.data) ? response.data : []);
          
          console.log('Fetched stocks:', stocksData); // Debug log
          setStocks(stocksData);
          return stocksData;
        } catch (error) {
          console.error('Error in getAllStocks:', error);
          throw error;
        }
      },
      null
    );
  }, [handleApiCall]);

  // Get stock by ID
  const getStockById = useCallback(async (id) => {
    return handleApiCall(
      async () => {
        try {
          console.log(`Fetching stock with ID: ${id}`);
          const response = await stockService.getStockById(id);
          
          // Check for the correct data structure
          const stockData = response.data && response.data.data 
            ? response.data.data 
            : response.data;
            
          console.log('Stock data retrieved:', stockData);
          return stockData;
        } catch (error) {
          console.error(`Error fetching stock with ID ${id}:`, error);
          throw error;
        }
      },
      null
    );
  }, [handleApiCall]);

  // Search stocks
  const searchStocks = useCallback(async (term) => {
    return handleApiCall(
      async () => {
        try {
          const response = await stockService.searchStocks(term);
          return response.data && response.data.data ? response.data.data : response.data;
        } catch (error) {
          console.error('Error searching stocks:', error);
          throw error;
        }
      },
      null
    );
  }, [handleApiCall]);

  // Get user's watchlist
  const getUserWatchlist = useCallback(async () => {
    return handleApiCall(
      async () => {
        try {
          const response = await stockService.getWatchlist();
          const watchlistData = response.data && response.data.data 
            ? response.data.data 
            : (Array.isArray(response.data) ? response.data : []);
          
          console.log('Watchlist data retrieved:', watchlistData);
          setWatchlist(watchlistData);
          return watchlistData;
        } catch (error) {
          console.error('Error getting watchlist:', error);
          throw error;
        }
      },
      null
    );
  }, [handleApiCall]);

  // Add stock to watchlist
  const addToWatchlist = useCallback(async (stockId) => {
    return handleApiCall(
      async () => {
        try {
          console.log(`Adding stock ${stockId} to watchlist`);
          await stockService.addToWatchlist(stockId);
          await getUserWatchlist();
        } catch (error) {
          console.error('Error adding to watchlist:', error);
          throw error;
        }
      },
      'Stock added to watchlist'
    );
  }, [handleApiCall, getUserWatchlist]);

  // Remove from watchlist
  const removeFromWatchlist = useCallback(async (stockId) => {
    return handleApiCall(
      async () => {
        try {
          console.log(`Removing stock ${stockId} from watchlist`);
          await stockService.removeFromWatchlist(stockId);
          setWatchlist(prevWatchlist => 
            prevWatchlist.filter(item => item.stock_id !== stockId)
          );
        } catch (error) {
          console.error('Error removing from watchlist:', error);
          throw error;
        }
      },
      'Stock removed from watchlist'
    );
  }, [handleApiCall]);

  // Buy stock
  const buyStock = useCallback(async (stockId, quantity, price) => {
    return handleApiCall(
      async () => {
        try {
          console.log('StockContext.buyStock called with:', { stockId, quantity, price });
          
          // Ensure all parameters are of the correct type
          const buyData = {
            stockId: parseInt(stockId) || stockId,
            quantity: parseInt(quantity),
            price: parseFloat(price)
          };
          
          console.log('Sending data to buyStock API:', buyData);
          const response = await userService.buyStock(buyData);
          console.log('Buy stock response:', response);
          
          // Fetch updated portfolio data
          await getUserPortfolio();
          
          return response.data && response.data.data ? response.data.data : response.data;
        } catch (error) {
          console.error('Error buying stock:', error);
          throw error;
        }
      },
      'Stock purchased successfully'
    );
  }, [handleApiCall, getUserPortfolio]);

  // Sell stock
  const sellStock = useCallback(async (stockId, quantity, price) => {
    return handleApiCall(
      async () => {
        try {
          console.log('Selling stock:', { stockId, quantity, price });
          
          // Ensure all parameters are of the correct type
          const sellData = {
            stockId: parseInt(stockId) || stockId,
            quantity: parseInt(quantity),
            price: parseFloat(price)
          };
          
          console.log('Sending data to sellStock API:', sellData);
          const response = await userService.sellStock(sellData);
          console.log('Sell stock response:', response);
          
          // Fetch updated portfolio data
          await getUserPortfolio();
          
          return response.data && response.data.data ? response.data.data : response.data;
        } catch (error) {
          console.error('Error selling stock:', error);
          throw error;
        }
      },
      'Stock sold successfully'
    );
  }, [handleApiCall, getUserPortfolio]);

  // Get user transactions
  const getUserTransactions = useCallback(async () => {
    return handleApiCall(
      async () => {
        try {
          const response = await userService.getTransactions();
          return response.data && response.data.data ? response.data.data : response.data;
        } catch (error) {
          console.error('Error getting transactions:', error);
          throw error;
        }
      },
      null
    );
  }, [handleApiCall]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
  }), [
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
  ]);

  return (
    <StockContext.Provider value={contextValue}>
      {children}
    </StockContext.Provider>
  );
};