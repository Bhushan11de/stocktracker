const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(protect);
router.use(isAdmin);

// User management routes
router.get('/users', adminController.getUsers);
router.get('/users/stats', adminController.getUserStats);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Stock management routes
router.post('/stocks', adminController.addStock);
router.put('/stocks/:id', adminController.updateStock);
router.delete('/stocks/:id', adminController.deleteStock);

// Transaction routes
router.get('/transactions', adminController.getAllTransactions);

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;