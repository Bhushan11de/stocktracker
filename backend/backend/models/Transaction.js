// backend/models/Transaction.js
const db = require('../config/db');

class Transaction {
  static async create(userId, stockId, type, quantity, price) {
    const totalAmount = quantity * price;
    
    const query = `
      INSERT INTO transactions (user_id, stock_id, type, quantity, price, total_amount)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [userId, stockId, type, quantity, price, totalAmount];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }
  
  static async getUserTransactions(userId) {
    const query = `
      SELECT t.*, s.symbol, s.name
      FROM transactions t
      JOIN stocks s ON t.stock_id = s.id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
  
  static async getTransactionsByStock(userId, stockId) {
    const query = `
      SELECT t.*, s.symbol, s.name
      FROM transactions t
      JOIN stocks s ON t.stock_id = s.id
      WHERE t.user_id = $1 AND t.stock_id = $2
      ORDER BY t.transaction_date DESC
    `;
    
    const result = await db.query(query, [userId, stockId]);
    return result.rows;
  }
  
  static async getAllTransactions() {
    const query = `
      SELECT t.*, s.symbol, s.name, u.email as user_email
      FROM transactions t
      JOIN stocks s ON t.stock_id = s.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.transaction_date DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }
  
  static async getUserSummary(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'buy' THEN total_amount ELSE 0 END) as total_purchases,
        SUM(CASE WHEN type = 'sell' THEN total_amount ELSE 0 END) as total_sales
      FROM transactions
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = Transaction;