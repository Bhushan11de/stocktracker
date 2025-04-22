const crypto = require('crypto');

// Generate random token for password reset
exports.generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Generate random token for email verification
exports.generateVerificationToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Generate random OTP (6 digits)
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};