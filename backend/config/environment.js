const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

// Helper function to parse port
const parsePort = (port) => {
  const parsedPort = parseInt(port, 10);
  return isNaN(parsedPort) ? 5001 : parsedPort;
};

// Helper function to parse boolean
const parseBoolean = (value) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return !!value;
};

// Base configuration template
const baseConfig = {
  port: parsePort(process.env.PORT),
  database: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  }
};

// Environment configurations
const config = {
  development: {
    ...baseConfig,
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parsePort(process.env.EMAIL_PORT) || 587,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM || 'Stock Market App <noreply@stockmarketapp.com>',
      secure: parseBoolean(process.env.EMAIL_SECURE),
      requireTLS: parseBoolean(process.env.EMAIL_REQUIRE_TLS)
    },
    frontend: {
      url: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info'
    }
  },
  production: {
    ...baseConfig,
    database: {
      ...baseConfig.database,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parsePort(process.env.EMAIL_PORT) || 465,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM || 'Stock Market App <noreply@stockmarketapp.com>',
      secure: true,
      requireTLS: true
    },
    frontend: {
      url: process.env.FRONTEND_URL || 'https://yourdomain.com'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'error'
    }
  },
  test: {
    ...baseConfig,
    database: {
      url: process.env.TEST_DATABASE_URL,
      dialect: 'postgres'
    },
    email: {
      host: 'localhost',
      port: 1025,
      user: '',
      pass: '',
      from: 'test@example.com',
      secure: false,
      requireTLS: false
    },
    jwt: {
      secret: 'test-secret',
      expiresIn: '1h'
    },
    frontend: {
      url: 'http://localhost:3000'
    },
    logging: {
      level: 'silent'
    }
  }
};

// Validate configuration
const validateConfig = (configToValidate) => {
  const errors = [];

  // Check critical configurations
  if (!configToValidate.jwt.secret) {
    errors.push('JWT secret is not defined');
  }

  if (!configToValidate.database.url) {
    errors.push('Database URL is not defined');
  }

  if (configToValidate.email && (!configToValidate.email.user || !configToValidate.email.pass)) {
    errors.push('Email credentials are incomplete');
  }

  if (errors.length > 0) {
    console.error('Configuration Validation Errors:', errors);
    throw new Error('Invalid configuration: ' + errors.join(', '));
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';

// Select and validate configuration
const selectedConfig = config[env];
validateConfig(selectedConfig);

// Log configuration details (excluding sensitive information)
console.log(`Running in ${env} environment`, {
  port: selectedConfig.port,
  emailFrom: selectedConfig.email.from,
  frontendUrl: selectedConfig.frontend.url,
  logLevel: selectedConfig.logging.level
});

module.exports = selectedConfig;