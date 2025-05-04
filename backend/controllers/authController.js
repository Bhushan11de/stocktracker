const User = require('../models/User');
const tokenManager = require('../utils/tokenManager');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const config = require('../config/environment');

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    console.log("Registration request received:", { 
      ...req.body, 
      password: '******' // Mask password in logs
    });

    const { email, password, firstName, lastName, role = 'user' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create user with optional role (defaults to 'user')
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role
    });

    // Send welcome email 
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
      // Continue with registration even if email fails
    }

    // Log successful registration
    console.log(`User registered successfully: ${user.email} (Role: ${user.role})`);

    // Send token response
    tokenManager.createSendToken(user, 201, res);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findByEmail(email);
    
    // Comprehensive login validation
    if (!user) {
      console.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        details: 'Email not found'
      });
    }

    // Compare passwords
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      console.warn(`Failed login attempt for email: ${email} - incorrect password`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        details: 'Incorrect password'
      });
    }

    // Log successful login attempt
    console.log('Successful Login:', {
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString()
    });

    // Send token response with full user details
    tokenManager.createSendToken(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Fetch full user details
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return sanitized user information
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address'
      });
    }

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'There is no user with that email'
      });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Update user with reset token and expiry
    await User.updatePasswordResetToken(email, hashedToken, resetTokenExpire);

    try {
      // Construct reset URL
      const resetURL = `${config.frontend.url}/reset-password/${resetToken}`;

      // Send reset email
      await emailService.sendPasswordResetEmail({
        to: email,
        resetURL: resetURL
      });

      console.log(`Password reset link sent to: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (err) {
      // If email fails, remove reset token
      await User.clearPasswordResetToken(email);

      console.error("Email sending error:", err);
      return res.status(500).json({
        success: false,
        error: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate inputs
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a new password'
      });
    }

    // Hash the incoming token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findByResetToken(hashedToken);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Reset password
    await User.resetPassword(user.id, password);

    console.log(`Password reset successful for user: ${user.email}`);

    // Send token response
    tokenManager.createSendToken(user, 200, res);
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new passwords'
      });
    }

    // Get user with password
    const user = await User.findByEmail(req.user.email);

    // Check current password
    const isMatch = await User.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    await User.updatePassword(user.id, newPassword);

    console.log(`Password updated for user: ${user.email}`);

    // Send token response
    tokenManager.createSendToken(user, 200, res);
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to update password',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};