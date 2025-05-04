const User = require('../models/User');
const tokenManager = require('../utils/tokenManager');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const config = require('../config/environment');

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
    user.passwordResetToken = hashedToken;
    user.passwordResetExpire = resetTokenExpire;
    await user.save({ validateBeforeSave: false });

    try {
      // Construct reset URL
      const resetURL = `${config.frontend.url}/reset-password/${resetToken}`;

      // Detailed logging
      console.log('Attempting to send password reset email:', {
        email: user.email,
        resetURL: resetURL
      });

      // Send reset email
      await emailService.sendPasswordResetEmail({
        to: user.email,
        resetURL: resetURL
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (err) {
      // If email fails, remove reset token
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error("Comprehensive email sending error:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });

      return res.status(500).json({
        success: false,
        error: 'Email could not be sent. Please try again later.',
        details: err.message
      });
    }
  } catch (error) {
    console.error("Forgot password process error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
      details: error.message
    });
  }
};