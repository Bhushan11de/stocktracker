// backend/middleware/connectionMiddleware.js
const { Pool } = require('pg');

let pool;

const createPool = () => {
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    max: 20, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // Connection timeout
    connectionTimeoutMillis: 5000, // How long to wait when connecting
    ssl: {
      rejectUnauthorized: false // Be careful with this in production
    }
  });

  // Handle connection errors
  pool.on('error', (err) => {
    console.error('Unexpected database error', err);
    process.exit(-1);
  });

  return pool;
};

const getConnection = async () => {
  if (!pool) {
    pool = createPool();
  }

  try {
    const client = await pool.connect();
    return client;
  } catch (err) {
    console.error('Error getting database connection', err);
    throw err;
  }
};

module.exports = {
  getConnection,
  pool
};