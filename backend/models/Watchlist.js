// backend/models/Watchlist.js
const db = require('../config/db');

class Watchlist {
  static async addStock(userId, stockId) {
    try {
      console.log(`Adding stock ${stockId} to watchlist for user ${userId}`);
      
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
        console.log(`Stock ${stockId} already in watchlist for user ${userId}`);
        throw new Error('Stock already in watchlist');
      }
      console.error('Error adding stock to watchlist:', error);
      throw error;
    }
  }
  
  static async removeStock(userId, stockId) {
    try {
      console.log(`Removing stock ${stockId} from watchlist for user ${userId}`);
      
      const query = `
        DELETE FROM watchlist
        WHERE user_id = $1 AND stock_id = $2
        RETURNING *
      `;
      
      const result = await db.query(query, [userId, stockId]);
      
      if (result.rows.length === 0) {
        console.log(`Stock ${stockId} not found in watchlist for user ${userId}`);
        throw new Error('Stock not found in watchlist');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error removing stock from watchlist:', error);
      throw error;
    }
  }
  
  static async getUserWatchlist(userId) {
    try {
      console.log(`Getting watchlist for user ${userId}`);
      
      const query = `
        SELECT w.*, s.symbol, s.name, s.current_price, s.previous_close
        FROM watchlist w
        JOIN stocks s ON w.stock_id = s.id
        WHERE w.user_id = $1
        ORDER BY s.symbol
      `;
      
      const result = await db.query(query, [userId]);
      console.log(`Found ${result.rows.length} stocks in watchlist`);
      return result.rows;
    } catch (error) {
      console.error('Error getting user watchlist:', error);
      throw error;
    }
  }
  
  static async isStockInWatchlist(userId, stockId) {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM watchlist
          WHERE user_id = $1 AND stock_id = $2
        ) as exists
      `;
      
      const result = await db.query(query, [userId, stockId]);
      return result.rows[0].exists;
    } catch (error) {
      console.error('Error checking if stock is in watchlist:', error);
      throw error;
    }
  }
  
  // New utility method to get watchlist count
  static async getWatchlistCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM watchlist
        WHERE user_id = $1
      `;
      
      const result = await db.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting watchlist count:', error);
      throw error;
    }
  }
}

module.exports = Watchlist;