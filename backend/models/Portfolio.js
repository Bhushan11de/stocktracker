// backend/models/Portfolio.js
const db = require('../config/db');

class Portfolio {
  static async addStock(userId, stockId, quantity, averageBuyPrice) {
    try {
      console.log(`Adding ${quantity} shares of stock ${stockId} to portfolio for user ${userId}`);
      
      // Check if the user already has this stock in portfolio
      const existingStock = await this.findUserStock(userId, stockId);
      
      if (existingStock) {
        // Update existing portfolio entry
        const newQuantity = existingStock.quantity + quantity;
        const newAvgPrice = ((existingStock.quantity * existingStock.average_buy_price) + 
                            (quantity * averageBuyPrice)) / newQuantity;
        
        console.log(`Updating existing portfolio entry: new quantity = ${newQuantity}, new average price = ${newAvgPrice}`);
        
        const query = `
          UPDATE portfolio
          SET quantity = $1,
              average_buy_price = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $3 AND stock_id = $4
          RETURNING *
        `;
        
        const result = await db.query(query, [newQuantity, newAvgPrice, userId, stockId]);
        return result.rows[0];
      } else {
        // Create new portfolio entry
        console.log(`Creating new portfolio entry with quantity ${quantity} and price ${averageBuyPrice}`);
        
        const query = `
          INSERT INTO portfolio (user_id, stock_id, quantity, average_buy_price)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        
        const result = await db.query(query, [userId, stockId, quantity, averageBuyPrice]);
        return result.rows[0];
      }
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
      throw error;
    }
  }
  
  static async sellStock(userId, stockId, quantity, sellPrice) {
    try {
      console.log(`Selling ${quantity} shares of stock ${stockId} for user ${userId}`);
      
      // Check if user has enough stocks to sell
      const portfolioStock = await this.findUserStock(userId, stockId);
      
      if (!portfolioStock) {
        console.error(`Stock ${stockId} not found in portfolio for user ${userId}`);
        throw new Error('Stock not found in portfolio');
      }
      
      if (portfolioStock.quantity < quantity) {
        console.error(`Not enough stocks to sell. Requested: ${quantity}, Available: ${portfolioStock.quantity}`);
        throw new Error(`Not enough stocks to sell. You have ${portfolioStock.quantity} shares available.`);
      }
      
      const newQuantity = portfolioStock.quantity - quantity;
      
      if (newQuantity === 0) {
        // Remove stock from portfolio if quantity becomes zero
        console.log(`Removing stock ${stockId} from portfolio as all shares were sold`);
        
        const query = `
          DELETE FROM portfolio
          WHERE user_id = $1 AND stock_id = $2
          RETURNING *
        `;
        
        const result = await db.query(query, [userId, stockId]);
        return result.rows[0];
      } else {
        // Update the quantity
        console.log(`Updating portfolio entry: new quantity = ${newQuantity}`);
        
        const query = `
          UPDATE portfolio
          SET quantity = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $2 AND stock_id = $3
          RETURNING *
        `;
        
        const result = await db.query(query, [newQuantity, userId, stockId]);
        return result.rows[0];
      }
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  }
  
  static async getUserPortfolio(userId) {
    try {
      console.log(`Getting portfolio for user ${userId}`);
      
      const query = `
        SELECT p.*, s.symbol, s.name, s.current_price, s.previous_close
        FROM portfolio p
        JOIN stocks s ON p.stock_id = s.id
        WHERE p.user_id = $1
        ORDER BY s.symbol
      `;
      
      const result = await db.query(query, [userId]);
      console.log(`Found ${result.rows.length} stocks in portfolio`);
      return result.rows;
    } catch (error) {
      console.error('Error getting user portfolio:', error);
      throw error;
    }
  }
  
  static async findUserStock(userId, stockId) {
    try {
      const query = `
        SELECT *
        FROM portfolio
        WHERE user_id = $1 AND stock_id = $2
      `;
      
      const result = await db.query(query, [userId, stockId]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error finding stock ${stockId} in portfolio for user ${userId}:`, error);
      throw error;
    }
  }
  
  static async getPortfolioValue(userId) {
    try {
      const query = `
        SELECT 
          COALESCE(SUM(p.quantity * s.current_price), 0) as total_value,
          COALESCE(SUM(p.quantity * p.average_buy_price), 0) as total_cost
        FROM portfolio p
        JOIN stocks s ON p.stock_id = s.id
        WHERE p.user_id = $1
      `;
      
      const result = await db.query(query, [userId]);
      return {
        totalValue: parseFloat(result.rows[0].total_value) || 0,
        totalCost: parseFloat(result.rows[0].total_cost) || 0,
        totalProfitLoss: parseFloat(result.rows[0].total_value - result.rows[0].total_cost) || 0
      };
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
      throw error;
    }
  }
  
  // New method to get portfolio count
  static async getPortfolioCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM portfolio
        WHERE user_id = $1
      `;
      
      const result = await db.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting portfolio count:', error);
      throw error;
    }
  }
  
  // New method for quick portfolio summary
  static async getPortfolioSummary(userId) {
    try {
      const portfolio = await this.getUserPortfolio(userId);
      
      const totalValue = portfolio.reduce((sum, item) => {
        return sum + (item.quantity * item.current_price);
      }, 0);
      
      const totalCost = portfolio.reduce((sum, item) => {
        return sum + (item.quantity * item.average_buy_price);
      }, 0);
      
      const totalProfitLoss = totalValue - totalCost;
      const profitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
      
      return {
        totalValue,
        totalCost,
        totalProfitLoss,
        profitLossPercentage,
        stockCount: portfolio.length
      };
    } catch (error) {
      console.error('Error generating portfolio summary:', error);
      throw error;
    }
  }
}

module.exports = Portfolio;