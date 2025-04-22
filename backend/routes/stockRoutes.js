// backend/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Stock routes
router.get('/', stockController.getAllStocks);
router.get('/search', stockController.searchStocks);
router.get('/watchlist', stockController.getWatchlist);
router.post('/watchlist/:id', stockController.addToWatchlist);
router.delete('/watchlist/:id', stockController.removeFromWatchlist);
router.get('/:id', stockController.getStock);

module.exports = router;