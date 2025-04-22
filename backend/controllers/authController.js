// backend/controllers/authController.js
const User = require('../models/User');
const tokenManager = require('../utils/tokenManager');
const emailUtils = require('../utils/email');

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    console.log("Registration request received:", req.body);
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    // Send welcome email (if available)
    if (typeof emailUtils.sendWelcomeEmail === 'function') {
      try {
        await emailUtils.sendWelcomeEmail(user);
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
        // Continue anyway
      }
    }

    // Send token response
    tokenManager.createSendToken(user, 201, res);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password is correct
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Send token response
    tokenManager.createSendToken(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'There is no user with that email'
      });
    }

    // Get reset token
    const resetToken = await User.createPasswordResetToken(email);
    if (!resetToken) {
      return res.status(500).json({
        success: false,
        error: 'Could not generate reset token'
      });
    }

    // Send email
    try {
      if (typeof emailUtils.sendPasswordResetEmail === 'function') {
        await emailUtils.sendPasswordResetEmail(email, resetToken, req);
      }

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (err) {
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
      error: 'Failed to process request'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Check if user exists with this token and token is not expired
    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Reset password
    await User.resetPassword(user.id, password);

    res.status(200).json({
      success: true,
      message: 'Password has been reset'
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

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
    const updatedUser = await User.updatePassword(user.id, newPassword);

    // Send token response
    tokenManager.createSendToken(updatedUser, 200, res);
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to update password'
    });
  }
};