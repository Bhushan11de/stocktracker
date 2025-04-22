// src/models/index.js
const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
const Stock = require('./Stock');
const Transaction = require('./Transaction');
const Watchlist = require('./Watchlist');
const UserStock = require('./UserStock');

// Define associations
const defineAssociations = () => {
  // User to Transactions (One-to-Many)
  User.hasMany(Transaction, {
    foreignKey: 'userId',
    as: 'transactions'
  });
  Transaction.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Stock to Transactions (One-to-Many)
  Stock.hasMany(Transaction, {
    foreignKey: 'stockId',
    as: 'transactions'
  });
  Transaction.belongsTo(Stock, {
    foreignKey: 'stockId',
    as: 'stock'
  });

  // User to Stocks (Many-to-Many through UserStock)
  User.belongsToMany(Stock, {
    through: UserStock,
    foreignKey: 'userId',
    otherKey: 'stockId',
    as: 'stocks'
  });
  Stock.belongsToMany(User, {
    through: UserStock,
    foreignKey: 'stockId',
    otherKey: 'userId',
    as: 'users'
  });

  // User to Watchlist (One-to-Many)
  User.hasMany(Watchlist, {
    foreignKey: 'userId',
    as: 'watchlist'
  });
  Watchlist.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Stock to Watchlist (One-to-Many)
  Stock.hasMany(Watchlist, {
    foreignKey: 'stockId',
    as: 'watchlists'
  });
  Watchlist.belongsTo(Stock, {
    foreignKey: 'stockId',
    as: 'stock'
  });
};

// Sync models with database
const syncModels = async () => {
  try {
    // Define associations before syncing
    defineAssociations();

    // Sync all models
    await sequelize.sync({
      // Use alter in development to modify existing tables
      alter: process.env.NODE_ENV === 'development'
    });

    console.log('Models synced successfully');
  } catch (error) {
    console.error('Unable to sync models:', error);
  }
};

// Function to reset database (use with caution, mainly for testing)
const resetDatabase = async () => {
  try {
    // Drop all tables
    await sequelize.drop();
    
    // Recreate tables
    await syncModels();
    
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Stock,
  Transaction,
  Watchlist,
  UserStock,
  defineAssociations,
  syncModels,
  resetDatabase
};