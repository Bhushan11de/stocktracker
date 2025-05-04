const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/environment');

// Protect routes - verify token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route. Please log in.',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Get user from the token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found. Please log in again.',
        });
      }
      
      // Attach user to request object with detailed logging
      console.log('User authentication details:', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role || 'user'  // Ensure role is always set
      };

      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Invalid or expired token.',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed. Please try again.'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Comprehensive logging for role verification
    console.log('Role Authorization Check:', {
      requiredRoles: roles,
      userRole: req.user ? req.user.role : 'No user',
      userExists: !!req.user
    });

    // Check if user exists and has the required role
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Please log in.'
      });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route. 
                Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  // Detailed logging for admin check
  console.log('Admin Privilege Check:', {
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    } : 'No user',
    isAdmin: req.user && req.user.role === 'admin'
  });

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'You need administrator privileges to access this page.',
      details: {
        userRole: req.user ? req.user.role : 'undefined',
        userExists: !!req.user
      }
    });
  }
  next();
};