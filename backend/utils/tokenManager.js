const jwt = require('jsonwebtoken');
const config = require('../config/environment');

// Generate JWT token with comprehensive payload
const generateToken = (user) => {
  // Ensure all necessary user details are included
  const payload = {
    id: user.id, 
    email: user.email,
    role: user.role || 'user',
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName
  };

  // Log token generation details (without sensitive info)
  console.log('Generating Token:', {
    userId: payload.id,
    email: payload.email,
    role: payload.role
  });

  return jwt.sign(
    payload, 
    config.jwt.secret, 
    { 
      expiresIn: config.jwt.expiresIn 
    }
  );
};

// Create and send token response
exports.createSendToken = (user, statusCode, res) => {
  // Generate token
  const token = generateToken(user);

  // Prepare response with comprehensive user details
  const response = {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name || user.firstName,
      lastName: user.last_name || user.lastName,
      role: user.role || 'user'
    }
  };

  // Log token creation (without sensitive details)
  console.log('Token Response Created:', {
    userId: response.user.id,
    email: response.user.email,
    role: response.user.role
  });

  // Send response
  res.status(statusCode).json(response);
};

// Verify token with enhanced error handling
exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Log verification details
    console.log('Token Verification:', {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role
    });

    return decoded;
  } catch (error) {
    console.error('Token Verification Error:', {
      name: error.name,
      message: error.message
    });
    return null;
  }
};