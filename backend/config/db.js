const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// SSL configuration
const sslConfig = process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false
} : false;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // AWS RDS ke liye required
  },
  connectionTimeoutMillis: 10000 // Timeout increase
});

// Enhanced connection test with schema verification
const testConnection = async (retries = 3, delay = 1000) => {
  let client;
  try {
    client = await pool.connect();
    
    // Verify basic schema access
    await client.query('SELECT 1');
    console.log('Database connected successfully');
    
    return true;
  } catch (err) {
    if (retries > 0) {
      console.log(`Connection failed. Retrying (${retries} attempts left)...`);
      await new Promise(res => setTimeout(res, delay));
      return testConnection(retries - 1, delay * 2);
    }
    console.error('Database connection error:', err.message);
    throw err;
  } finally {
    if (client) client.release();
  }
};

// Safe table creation with existence checks
const createTable = async (client, tableName, createQuery) => {
  try {
    // Check if table exists first
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )`;
    const exists = await client.query(checkQuery, [tableName]);
    
    if (!exists.rows[0].exists) {
      await client.query(createQuery);
      console.log(`Created table: ${tableName}`);
    } else {
      console.log(`Table ${tableName} already exists - skipping creation`);
    }
  } catch (err) {
    if (err.code === '23505') {
      console.log(`Sequence for ${tableName} already exists - continuing`);
      return;
    }
    throw err;
  }
};

// Initialize database tables with enhanced error handling
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Define all tables with their creation queries
    const tables = {
      users: `
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
      stocks: `
        CREATE TABLE stocks (
          id SERIAL PRIMARY KEY,
          symbol VARCHAR(20) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          current_price DECIMAL(15, 2) NOT NULL,
          previous_close DECIMAL(15, 2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`,
      portfolio: `
        CREATE TABLE portfolio (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL CHECK (quantity >= 0),
          average_buy_price DECIMAL(15, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, stock_id)
        )`,
      watchlist: `
        CREATE TABLE watchlist (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
          added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, stock_id)
        )`,
      transactions: `
        CREATE TABLE transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
          type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
          quantity INTEGER NOT NULL,
          price DECIMAL(15, 2) NOT NULL,
          transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`
    };

    // Create tables in proper order
    await createTable(client, 'users', tables.users);
    await createTable(client, 'stocks', tables.stocks);
    await createTable(client, 'portfolio', tables.portfolio);
    await createTable(client, 'watchlist', tables.watchlist);
    await createTable(client, 'transactions', tables.transactions);

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_stock_id ON transactions(stock_id)',
      'CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id)'
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }

    await client.query('COMMIT');
    console.log('Database initialization completed');
  } catch (err) {
    await client.query('ROLLBACK');
    
    if (err.code === '23505') {
      console.log('Database objects already exist - continuing');
      return;
    }
    
    console.error('Database initialization error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

// Reset database (for development only)
const resetDb = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Drop tables in reverse dependency order
    await client.query('DROP TABLE IF EXISTS transactions CASCADE');
    await client.query('DROP TABLE IF EXISTS watchlist CASCADE');
    await client.query('DROP TABLE IF EXISTS portfolio CASCADE');
    await client.query('DROP TABLE IF EXISTS stocks CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    
    await client.query('COMMIT');
    console.log('Database reset complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database reset error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  testConnection,
  initDb,
  resetDb,
  initializeDatabase: async () => {
    try {
      await testConnection();
      await initDb();
    } catch (err) {
      console.error('Database initialization failed:', err.message);
      process.exit(1);
    }
  }
};