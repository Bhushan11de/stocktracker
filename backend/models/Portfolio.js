// backend/models/Portfolio.js
const db = require('../config/db');

class Portfolio {
  static async addStock(userId, stockId, quantity, averageBuyPrice) {
    // Check if the user already has this stock in portfolio
    const existingStock = await this.findUserStock(userId, stockId);
    
    if (existingStock) {
      // Update existing portfolio entry
      const newQuantity = existingStock.quantity + quantity;
      const newAvgPrice = ((existingStock.quantity * existingStock.average_buy_price) + 
                           (quantity * averageBuyPrice)) / newQuantity;
      
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
      const query = `
        INSERT INTO portfolio (user_id, stock_id, quantity, average_buy_price)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await db.query(query, [userId, stockId, quantity, averageBuyPrice]);
      return result.rows[0];
    }
  }
  
  static async sellStock(userId, stockId, quantity, sellPrice) {
    // Check if user has enough stocks to sell
    const portfolioStock = await this.findUserStock(userId, stockId);
    
    if (!portfolioStock || portfolioStock.quantity < quantity) {
      throw new Error('Not enough stocks to sell');
    }
    
    const newQuantity = portfolioStock.quantity - quantity;
    
    if (newQuantity === 0) {
      // Remove stock from portfolio if quantity becomes zero
      const query = `
        DELETE FROM portfolio
        WHERE user_id = $1 AND stock_id = $2
        RETURNING *
      `;
      
      const result = await db.query(query, [userId, stockId]);
      return result.rows[0];
    } else {
      // Update the quantity
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
  }
  
  static async getUserPortfolio(userId) {
    const query = `
      SELECT p.*, s.symbol, s.name, s.current_price
      FROM portfolio p
      JOIN stocks s ON p.stock_id = s.id
      WHERE p.user_id = $1
      ORDER BY s.symbol
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
  
  static async findUserStock(userId, stockId) {
    const query = `
      SELECT *
      FROM portfolio
      WHERE user_id = $1 AND stock_id = $2
    `;
    
    const result = await db.query(query, [userId, stockId]);
    return result.rows[0];
  }
  
  static async getPortfolioValue(userId) {
    const query = `
      SELECT 
        SUM(p.quantity * s.current_price) as total_value,
        SUM(p.quantity * p.average_buy_price) as total_cost
      FROM portfolio p
      JOIN stocks s ON p.stock_id = s.id
      WHERE p.user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = Portfolio;