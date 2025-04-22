// backend/controllers/stockController.js
const Stock = require('../models/Stock');
const Watchlist = require('../models/Watchlist');

// @desc    Get all stocks
// @route   GET /api/stocks
// @access  Private
exports.getAllStocks = async (req, res, next) => {
  try {
    const stocks = await Stock.getAll();

    res.status(200).json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock by ID
// @route   GET /api/stocks/:id
// @access  Private
exports.getStock = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    // Check if stock is in user's watchlist
    let isInWatchlist = false;
    if (req.user) {
      isInWatchlist = await Watchlist.isStockInWatchlist(req.user.id, stock.id);
    }

    res.status(200).json({
      success: true,
      data: { ...stock, isInWatchlist }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search stocks
// @route   GET /api/stocks/search
// @access  Private
exports.searchStocks = async (req, res, next) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search term'
      });
    }

    const stocks = await Stock.search(term);

    res.status(200).json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add stock to watchlist
// @route   POST /api/stocks/watchlist/:id
// @access  Private
exports.addToWatchlist = async (req, res, next) => {
  try {
    const stockId = req.params.id;

    // Check if stock exists
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    // Check if already in watchlist
    const isInWatchlist = await Watchlist.isStockInWatchlist(req.user.id, stockId);
    if (isInWatchlist) {
      return res.status(400).json({
        success: false,
        error: 'Stock already in watchlist'
      });
    }

    // Add to watchlist
    await Watchlist.addStock(req.user.id, stockId);

    res.status(200).json({
      success: true,
      message: 'Stock added to watchlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove stock from watchlist
// @route   DELETE /api/stocks/watchlist/:id
// @access  Private
exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const stockId = req.params.id;

    // Check if in watchlist
    const isInWatchlist = await Watchlist.isStockInWatchlist(req.user.id, stockId);
    if (!isInWatchlist) {
      return res.status(400).json({
        success: false,
        error: 'Stock not in watchlist'
      });
    }

    // Remove from watchlist
    await Watchlist.removeStock(req.user.id, stockId);

    res.status(200).json({
      success: true,
      message: 'Stock removed from watchlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's watchlist
// @route   GET /api/stocks/watchlist
// @access  Private
exports.getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.getUserWatchlist(req.user.id);

    res.status(200).json({
      success: true,
      count: watchlist.length,
      data: watchlist
    });
  } catch (error) {
    next(error);
  }
};