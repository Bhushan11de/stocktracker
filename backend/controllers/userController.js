// backend/controllers/userController.js
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const Watchlist = require('../models/Watchlist'); // Added this import
const emailUtils = require('../utils/email');

// @desc    Get user's portfolio
// @route   GET /api/users/portfolio
// @access  Private
exports.getPortfolio = async (req, res, next) => {
  try {
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

    res.status(200).json({
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
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buy stock
// @route   POST /api/users/buy
// @access  Private
exports.buyStock = async (req, res, next) => {
  try {
    const { stockId, quantity, price } = req.body;
    
    // Validate input
    if (!stockId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        error: 'Please provide stockId, quantity and price'
      });
    }
    
    // Check if stock exists
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }
    
    // Create transaction record
    const transaction = await Transaction.create(
      req.user.id, 
      stockId, 
      'buy', 
      quantity, 
      price
    );
    
    // Update portfolio
    await Portfolio.addStock(req.user.id, stockId, quantity, price);
    
    // Send email notification (non-blocking)
    emailUtils.sendTransactionEmail(req.user, { 
      ...transaction, 
      symbol: stock.symbol 
    }, stock.name).catch(err => console.error('Email error:', err));
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sell stock
// @route   POST /api/users/sell
// @access  Private
exports.sellStock = async (req, res, next) => {
  try {
    const { stockId, quantity, price } = req.body;
    
    // Validate input
    if (!stockId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        error: 'Please provide stockId, quantity and price'
      });
    }
    
    // Check if stock exists
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }
    
    // Check if user has enough stocks to sell
    const portfolioItem = await Portfolio.findUserStock(req.user.id, stockId);
    if (!portfolioItem || portfolioItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Not enough stocks to sell'
      });
    }
    
    // Create transaction record
    const transaction = await Transaction.create(
      req.user.id, 
      stockId, 
      'sell', 
      quantity, 
      price
    );
    
    // Update portfolio
    await Portfolio.sellStock(req.user.id, stockId, quantity, price);
    
    // Send email notification (non-blocking)
    emailUtils.sendTransactionEmail(req.user, { 
      ...transaction, 
      symbol: stock.symbol 
    }, stock.name).catch(err => console.error('Email error:', err));
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's transactions
// @route   GET /api/users/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.getUserTransactions(req.user.id);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's dashboard data
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
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
    
    // Get recent transactions
    const transactions = await Transaction.getUserTransactions(req.user.id);
    const recentTransactions = transactions.slice(0, 5);
    
    // Get transaction summary
    const summary = await Transaction.getUserSummary(req.user.id);
    
    // Get watchlist
    const watchlist = await Watchlist.getUserWatchlist(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        portfolioSummary: {
          totalValue,
          totalCost,
          totalProfitLoss,
          profitLossPercentage: totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0
        },
        transactionSummary: summary,
        recentTransactions,
        watchlist
      }
    });
  } catch (error) {
    next(error);
  }
};