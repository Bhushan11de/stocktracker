// backend/middleware/error.js

// Custom error handler
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    // Log error for developer
    console.error(err);
  
    // PostgreSQL unique constraint error
    if (err.code === '23505') {
      const field = err.detail.match(/\((.*?)\)/)[1];
      const message = `${field} already exists`;
      error = new Error(message);
      return res.status(400).json({
        success: false,
        error: message
      });
    }
  
    // PostgreSQL foreign key constraint error
    if (err.code === '23503') {
      const message = 'Resource not found or referenced resource does not exist';
      error = new Error(message);
      return res.status(404).json({
        success: false,
        error: message
      });
    }
  
    // JWT token errors
    if (err.name === 'JsonWebTokenError') {
      const message = 'Invalid token';
      return res.status(401).json({
        success: false,
        error: message
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      const message = 'Token expired';
      return res.status(401).json({
        success: false,
        error: message
      });
    }
  
    // Default error response
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  };
  
  module.exports = errorHandler;