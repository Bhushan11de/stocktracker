// backend/models/Watchlist.js
const db = require('../config/db');

class Watchlist {
  static async addStock(userId, stockId) {
    try {
      const query = `
        INSERT INTO watchlist (user_id, stock_id)
        VALUES ($1, $2)
        RETURNING *
      `;
      
      const result = await db.query(query, [userId, stockId]);
      return result.rows[0];
    } catch (error) {
      // Check if error is due to duplicate entry
      if (error.code === '23505') { // Unique violation error code
        throw new Error('Stock already in watchlist');
      }
      throw error;
    }
  }
  
  static async removeStock(userId, stockId) {
    const query = `
      DELETE FROM watchlist
      WHERE user_id = $1 AND stock_id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [userId, stockId]);
    return result.rows[0];
  }
  
  static async getUserWatchlist(userId) {
    const query = `
      SELECT w.*, s.symbol, s.name, s.current_price, s.previous_close
      FROM watchlist w
      JOIN stocks s ON w.stock_id = s.id
      WHERE w.user_id = $1
      ORDER BY s.symbol
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
  
  static async isStockInWatchlist(userId, stockId) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM watchlist
        WHERE user_id = $1 AND stock_id = $2
      ) as exists
    `;
    
    const result = await db.query(query, [userId, stockId]);
    return result.rows[0].exists;
  }
}

module.exports = Watchlist;