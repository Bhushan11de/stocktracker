// backend/middleware/role.js

// Middleware to check if the user is an admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Admin role required'
      });
    }
  };
  
  // Middleware to check if the user is accessing their own resources
  exports.isOwner = (paramName) => {
    return (req, res, next) => {
      const userId = parseInt(req.params[paramName]);
      
      // Check if user ID in params matches authenticated user's ID
      if (req.user && (req.user.id === userId || req.user.role === 'admin')) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You can only access your own resources'
        });
      }
    };
  };