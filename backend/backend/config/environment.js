// src/config/environment.js
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Environment configuration
const config = {
  development: {
    port: process.env.PORT || 5001,
    database: {
      url: process.env.DATABASE_URL,
      dialect: 'postgres'
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h'
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  production: {
    port: process.env.PORT || 5001,
    database: {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    }
  },
  test: {
    port: process.env.PORT || 5001,
    database: {
      url: process.env.TEST_DATABASE_URL,
      dialect: 'postgres'
    }
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';

// Export configuration for the current environment
module.exports = config[env];