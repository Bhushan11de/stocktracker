// src/seeders/initialSeed.js
const { User, Stock, Transaction } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.destroy({ where: {} });
    await Stock.destroy({ where: {} });
    await Transaction.destroy({ where: {} });

    // Create Admin User
    const adminUser = await User.create({
      email: 'admin@stockmarket.com',
      password: 'AdminPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    // Create Regular User
    const regularUser = await User.create({
      email: 'user@stockmarket.com',
      password: 'UserPassword123!',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user'
    });

    // Seed Stocks
    const stocks = await Stock.bulkCreate([
      {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        currentPrice: 150.25,
        sector: 'Technology',
        description: 'Leading technology company',
        openPrice: 148.50,
        highPrice: 152.00,
        lowPrice: 147.75,
        previousClose: 149.00,
        volume: 35000000
      },
      {
        symbol: 'GOOGL',
        companyName: 'Alphabet Inc.',
        currentPrice: 2750.50,
        sector: 'Technology',
        description: 'Global technology leader',
        openPrice: 2740.00,
        highPrice: 2760.00,
        lowPrice: 2735.25,
        previousClose: 2745.00,
        volume: 1500000
      },
      {
        symbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        currentPrice: 325.75,
        sector: 'Technology',
        description: 'Multinational technology company',
        openPrice: 323.00,
        highPrice: 328.50,
        lowPrice: 322.25,
        previousClose: 324.00,
        volume: 20000000
      },
      {
        symbol: 'AMZN',
        companyName: 'Amazon.com Inc.',
        currentPrice: 3350.25,
        sector: 'E-commerce',
        description: 'Global e-commerce and cloud computing company',
        openPrice: 3340.00,
        highPrice: 3360.00,
        lowPrice: 3335.50,
        previousClose: 3345.00,
        volume: 2500000
      },
      {
        symbol: 'TSLA',
        companyName: 'Tesla Inc.',
        currentPrice: 750.50,
        sector: 'Automotive',
        description: 'Electric vehicle and clean energy company',
        openPrice: 745.00,
        highPrice: 755.25,
        lowPrice: 740.75,
        previousClose: 748.00,
        volume: 10000000
      }
    ]);

    console.log('Database seeded successfully');
    return { adminUser, regularUser, stocks };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;

// Seed script to be run directly
if (require.main === module) {
  const { sequelize } = require('../config/database');
  
  sequelize.sync({ force: true })
    .then(() => seedDatabase())
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}