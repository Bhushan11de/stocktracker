// backend/controllers/adminController.js
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user portfolio
    const portfolio = await Portfolio.getUserPortfolio(user.id);
    
    // Get user transactions
    const transactions = await Transaction.getUserTransactions(user.id);

    // Get user summary
    const summary = await Transaction.getUserSummary(user.id);

    res.status(200).json({
      success: true,
      data: {
        user,
        portfolio,
        transactions,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Role must be either admin or user'
      });
    }
    
    const user = await User.updateUserRole(req.params.id, role);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.deleteUser(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res, next) => {
  try {
    const roleCounts = await User.countUsersByRole();
    const newUsers = await User.getNewUsers(30);
    
    res.status(200).json({
      success: true,
      data: {
        roleCounts,
        newUsersCount: newUsers.length,
        newUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new stock
// @route   POST /api/admin/stocks
// @access  Private/Admin
exports.addStock = async (req, res, next) => {
  try {
    const {
      symbol,
      name,
      current_price,     // Changed from currentPrice
      previous_close,    // Changed from previousClose
      market_cap,        // Changed from marketCap
      volume,
      description
    } = req.body;

    // Validate required fields
    if (!symbol || !name || current_price === undefined || current_price === null) {
      return res.status(400).json({
        success: false,
        error: 'Symbol, name, and current_price are required fields'
      });
    }

    // Check if stock already exists
    const existingStock = await Stock.findBySymbol(symbol);
    if (existingStock) {
      return res.status(400).json({
        success: false,
        error: 'Stock with this symbol already exists'
      });
    }

    // Create stock
    const stock = await Stock.create({
      symbol,
      name,
      current_price,     // Changed from currentPrice
      previous_close,    // Changed from previousClose
      market_cap,        // Changed from marketCap
      volume,
      description
    });

    res.status(201).json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Stock creation error:', error);
    next(error);
  }
};

// @desc    Update stock
// @route   PUT /api/admin/stocks/:id
// @access  Private/Admin
exports.updateStock = async (req, res, next) => {
  try {
    const stockId = req.params.id;
    
    // Check if stock exists
    const existingStock = await Stock.findById(stockId);
    if (!existingStock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    // Update stock with correct field names
    const {
      symbol,
      name,
      current_price,    // Changed from currentPrice
      previous_close,   // Changed from previousClose
      market_cap,       // Changed from marketCap
      volume,
      description
    } = req.body;

    // Create updated stock data object
    const stockData = {};
    
    if (symbol !== undefined) stockData.symbol = symbol;
    if (name !== undefined) stockData.name = name;
    if (current_price !== undefined) stockData.current_price = current_price;
    if (previous_close !== undefined) stockData.previous_close = previous_close;
    if (market_cap !== undefined) stockData.market_cap = market_cap;
    if (volume !== undefined) stockData.volume = volume;
    if (description !== undefined) stockData.description = description;

    // Update stock
    const stock = await Stock.update(stockId, stockData);

    res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Stock update error:', error);
    next(error);
  }
};

// @desc    Delete stock
// @route   DELETE /api/admin/stocks/:id
// @access  Private/Admin
exports.deleteStock = async (req, res, next) => {
  try {
    const stockId = req.params.id;
    
    // Check if stock exists
    const existingStock = await Stock.findById(stockId);
    if (!existingStock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    // Delete stock
    const stock = await Stock.delete(stockId);

    res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.getAllTransactions();

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get total users
    const usersResult = await User.getAllUsers();
    const totalUsers = usersResult.length;
    
    // Get total stocks
    const stocksResult = await Stock.getAll();
    const totalStocks = stocksResult.length;
    
    // Get total transactions
    const transactionsResult = await Transaction.getAllTransactions();
    const totalTransactions = transactionsResult.length;
    
    // Calculate transaction volume
    const buyVolume = transactionsResult
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
      
    const sellVolume = transactionsResult
      .filter(t => t.type === 'sell')
      .reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
    
    // Get recent transactions
    const recentTransactions = transactionsResult.slice(0, 5);
    
    // Get user statistics
    const roleCounts = await User.countUsersByRole();
    const newUsers = await User.getNewUsers(30);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStocks,
        totalTransactions,
        buyVolume,
        sellVolume,
        recentTransactions,
        userStats: {
          roleCounts,
          newUsersCount: newUsers.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};