// src/config/database.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const winston = require('winston'); // Recommended for advanced logging

// Load environment variables
dotenv.config();

// Create a logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // Log to console if not in production
    ...(process.env.NODE_ENV !== 'production' 
      ? [new winston.transports.Console({
          format: winston.format.simple()
        })] 
      : [])
  ]
});

// Create Sequelize instance with improved configuration
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  
  // Logging configuration
  logging: (msg) => {
    if (process.env.NODE_ENV === 'development') {
      logger.info(msg);
    }
  },
  
  // Connection pool configuration
  pool: {
    max: 10, // Increased max connections
    min: 0,
    acquire: 45000, // Increased acquire timeout
    idle: 15000, // Increased idle timeout
    evict: 15000, // Add eviction interval
    handleDisconnects: true // Automatically reconnect
  },
  
  // Define options
  define: {
    freezeTableName: true,
    timestamps: true,
    underscored: true // Use snake_case for automatically added attributes
  },
  
  // Additional configuration for robustness
  dialectOptions: {
    // SSL configuration for production
    ...(process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false // Be cautious with this in production
      }
    } : {}),
    
    // Connection timeout
    connectTimeout: 60000
  },
  
  // Retry strategy for connection
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotReachableError/,
      /SequelizeAccessDeniedError/
    ],
    max: 5, // Maximum number of connection attempts
    backoffBase: 1000, // Initial backoff time in ms
    backoffExponent: 1.5 // Exponential backoff factor
  }
});

// Enhanced connection test with comprehensive error handling
const testConnection = async () => {
  try {
    // Attempt to authenticate
    await sequelize.authenticate({
      logging: false // Suppress logging for this operation
    });
    
    logger.info('Database connection established successfully.');
    
    // Optional: Perform additional checks
    const result = await sequelize.query('SELECT 1 AS status', { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    if (result[0].status === 1) {
      logger.info('Database query test successful.');
    }
  } catch (error) {
    // Detailed error logging
    logger.error('Database connection error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Additional error handling based on error type
    if (error.name === 'SequelizeConnectionError') {
      logger.error('Connection refused. Check database host, port, and credentials.');
    } else if (error.name === 'SequelizeAccessDeniedError') {
      logger.error('Access denied. Verify username and password.');
    }

    // Optionally, you can implement a retry mechanism or send alerts
    throw error; // Re-throw to allow caller to handle
  }
};

// Graceful shutdown method
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed successfully.');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await closeConnection();
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

module.exports = {
  sequelize,
  testConnection,
  closeConnection
};