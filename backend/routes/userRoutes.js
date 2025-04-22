// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// User routes
router.get('/portfolio', userController.getPortfolio);
router.post('/buy', userController.buyStock);
router.post('/sell', userController.sellStock);
router.get('/transactions', userController.getTransactions);
router.get('/dashboard', userController.getDashboard);

module.exports = router;