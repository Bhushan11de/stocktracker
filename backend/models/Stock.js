// backend/models/Stock.js
const db = require('../config/db');

class Stock {
  static async create(stockData) {
    const {
      symbol,
      name,
      currentPrice,
      previousClose,
      marketCap,
      volume,
      description
    } = stockData;

    const query = `
      INSERT INTO stocks (
        symbol, name, current_price, previous_close, 
        market_cap, volume, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      symbol.toUpperCase(), 
      name, 
      currentPrice, 
      previousClose, 
      marketCap, 
      volume, 
      description
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM stocks WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findBySymbol(symbol) {
    const query = 'SELECT * FROM stocks WHERE symbol = $1';
    const result = await db.query(query, [symbol.toUpperCase()]);
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT * FROM stocks ORDER BY symbol';
    const result = await db.query(query);
    return result.rows;
  }

  static async update(id, stockData) {
    const {
      symbol,
      name,
      currentPrice,
      previousClose,
      marketCap,
      volume,
      description
    } = stockData;

    const query = `
      UPDATE stocks
      SET symbol = $1,
          name = $2,
          current_price = $3,
          previous_close = $4,
          market_cap = $5,
          volume = $6,
          description = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      symbol.toUpperCase(),
      name,
      currentPrice,
      previousClose,
      marketCap,
      volume,
      description,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updatePrice(id, currentPrice, previousClose = null) {
    const query = `
      UPDATE stocks
      SET current_price = $1,
          previous_close = CASE WHEN $2 IS NOT NULL THEN $2 ELSE previous_close END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await db.query(query, [currentPrice, previousClose, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM stocks WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async search(term) {
    const query = `
      SELECT * FROM stocks
      WHERE symbol ILIKE $1 OR name ILIKE $1
      ORDER BY symbol
    `;
    
    const result = await db.query(query, [`%${term}%`]);
    return result.rows;
  }
}

module.exports = Stock;