// backend/controllers/userController.js
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const Watchlist = require('../models/Watchlist'); 
const emailUtils = require('../utils/email');

// @desc    Get user's portfolio
// @route   GET /api/users/portfolio
// @access  Private
exports.getPortfolio = async (req, res, next) => {
  try {
    console.log(`Fetching portfolio for user ${req.user.id}`);
    const portfolio = await Portfolio.getUserPortfolio(req.user.id);
    
    // Calculate total value
    const totalValue = portfolio.reduce((sum, item) => {
      return sum + (item.quantity * item.current_price);
    }, 0);
    
    // Calculate total cost
    const totalCost = portfolio.reduce((sum, item) => {
      return sum + (item.quantity * item.average_buy_price);
    }, 0);
    
    // Calculate total profit/loss
    const totalProfitLoss = totalValue - totalCost;
    
    // Calculate profit/loss percentage
    const profitLossPercentage = totalCost > 0 
      ? (totalProfitLoss / totalCost) * 100 
      : 0;

    const responseData = {
      success: true,
      count: portfolio.length,
      data: {
        portfolio,
        summary: {
          totalValue,
          totalCost,
          totalProfitLoss,
          profitLossPercentage
        }
      }
    };

    console.log('Portfolio response prepared:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in getPortfolio:', error);
    next(error);
  }
};

// @desc    Buy stock
// @route   POST /api/users/buy
// @access  Private
exports.buyStock = async (req, res, next) => {
  try {
    const { stockId, quantity, price } = req.body;
    
    console.log('Buy stock request received:', { stockId, quantity, price, userId: req.user.id });
    
    // Validate input
    if (!stockId) {
      return res.status(400).json({
        success: false,
        error: 'Stock ID is required'
      });
    }
    
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive number'
      });
    }
    
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a positive number'
      });
    }
    
    // Ensure data is in the right format
    const parsedStockId = parseInt(stockId) || stockId;
    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(price);
    
    // Check if stock exists
    const stock = await Stock.findById(parsedStockId);
    if (!stock) {
      console.log(`Stock not found with ID: ${parsedStockId}`);
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }
    
    console.log('Stock found:', stock);
    
    // Create transaction record
    const transaction = await Transaction.create(
      req.user.id, 
      parsedStockId, 
      'buy', 
      parsedQuantity, 
      parsedPrice
    );
    
    console.log('Transaction created:', transaction);
    
    // Update portfolio
    const portfolioUpdate = await Portfolio.addStock(req.user.id, parsedStockId, parsedQuantity, parsedPrice);
    console.log('Portfolio updated:', portfolioUpdate);
    
    // Send email notification (non-blocking)
    try {
      await emailUtils.sendTransactionEmail(req.user, { 
        ...transaction, 
        symbol: stock.symbol 
      }, stock.name);
    } catch (emailErr) {
      console.error('Email error:', emailErr);
      // Continue execution even if email fails
    }
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Buy stock error:', error);
    next(error);
  }
};

// @desc    Sell stock
// @route   POST /api/users/sell
// @access  Private
exports.sellStock = async (req, res, next) => {
  try {
    const { stockId, quantity, price } = req.body;
    
    console.log('Sell stock request received:', { stockId, quantity, price, userId: req.user.id });
    
    // Validate input
    if (!stockId) {
      return res.status(400).json({
        success: false,
        error: 'Stock ID is required'
      });
    }
    
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive number'
      });
    }
    
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a positive number'
      });
    }
    
    // Ensure data is in the right format
    const parsedStockId = parseInt(stockId) || stockId;
    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(price);
    
    // Check if stock exists
    const stock = await Stock.findById(parsedStockId);
    if (!stock) {
      console.log(`Stock not found with ID: ${parsedStockId}`);
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }
    
    // Check if user has enough stocks to sell
    const portfolioItem = await Portfolio.findUserStock(req.user.id, parsedStockId);
    if (!portfolioItem) {
      return res.status(400).json({
        success: false,
        error: 'You do not own this stock'
      });
    }
    
    if (portfolioItem.quantity < parsedQuantity) {
      return res.status(400).json({
        success: false,
        error: `Not enough stocks to sell. You own ${portfolioItem.quantity} shares.`
      });
    }
    
    console.log('Portfolio item found:', portfolioItem);
    
    // Create transaction record
    const transaction = await Transaction.create(
      req.user.id, 
      parsedStockId, 
      'sell', 
      parsedQuantity, 
      parsedPrice
    );
    
    console.log('Transaction created:', transaction);
    
    // Update portfolio
    const portfolioUpdate = await Portfolio.sellStock(req.user.id, parsedStockId, parsedQuantity, parsedPrice);
    console.log('Portfolio updated:', portfolioUpdate);
    
    // Send email notification (non-blocking)
    try {
      await emailUtils.sendTransactionEmail(req.user, { 
        ...transaction, 
        symbol: stock.symbol 
      }, stock.name);
    } catch (emailErr) {
      console.error('Email error:', emailErr);
      // Continue execution even if email fails
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Sell stock error:', error);
    next(error);
  }
};

// @desc    Get user's transactions
// @route   GET /api/users/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    console.log(`Fetching transactions for user ${req.user.id}`);
    const transactions = await Transaction.getUserTransactions(req.user.id);
    
    console.log(`Found ${transactions.length} transactions`);
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    next(error);
  }
};

// @desc    Get user's dashboard data
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    console.log(`Fetching dashboard data for user ${req.user.id}`);
    
    // Get portfolio
    const portfolio = await Portfolio.getUserPortfolio(req.user.id);
    
    // Calculate portfolio values
    const totalValue = portfolio.reduce((sum, item) => {
      return sum + (item.quantity * item.current_price);
    }, 0);
    
    const totalCost = portfolio.reduce((sum, item) => {
      return sum + (item.quantity * item.average_buy_price);
    }, 0);
    
    const totalProfitLoss = totalValue - totalCost;
    const profitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
    
    // Get recent transactions
    const transactions = await Transaction.getUserTransactions(req.user.id);
    const recentTransactions = transactions.slice(0, 5);
    
    // Get transaction summary
    const summary = await Transaction.getUserSummary(req.user.id);
    
    // Get watchlist
    const watchlist = await Watchlist.getUserWatchlist(req.user.id);
    
    const dashboardData = {
      success: true,
      data: {
        portfolioSummary: {
          totalValue,
          totalCost,
          totalProfitLoss,
          profitLossPercentage
        },
        transactionSummary: summary,
        recentTransactions,
        watchlist
      }
    };
    
    console.log('Dashboard data prepared');
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error in getDashboard:', error);
    next(error);
  }
};