// backend/utils/tokenManager.js
const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

// Create response with token
exports.createSendToken = (user, statusCode, res) => {
  const token = this.generateToken(user);

  // Remove password from output
  if (user.password) {
    user.password = undefined;
  }
  
  res.status(statusCode).json({
    success: true,
    token,
    data: user
  });
};