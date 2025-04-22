// backend/utils/email.js
const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send reset password email
exports.sendPasswordResetEmail = async (email, resetToken, req) => {
  // Create password reset URL
  const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
  
  const message = `
    You are receiving this email because you (or someone else) has requested to reset your password.
    Please click on the following link to reset your password:
    ${resetURL}
    If you didn't request this, please ignore this email.
  `;
  
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Token',
      text: message
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to Stock Market App',
      text: `
        Hello ${user.first_name},
        
        Welcome to Stock Market App! We're excited to have you on board.
        
        Feel free to explore the app and start trading!
        
        Best regards,
        The Stock Market App Team
      `
    });
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error here, just log it to not block registration
    return false;
  }
};

// Send transaction confirmation email
exports.sendTransactionEmail = async (user, transaction, stockName) => {
  try {
    const transactionType = transaction.type === 'buy' ? 'purchased' : 'sold';
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Stock ${transaction.type === 'buy' ? 'Purchase' : 'Sale'} Confirmation`,
      text: `
        Hello ${user.first_name},
        
        This is a confirmation that you have successfully ${transactionType} ${transaction.quantity} shares of ${stockName} (${transaction.symbol}) at $${transaction.price} per share.
        
        Total transaction amount: $${transaction.total_amount}
        
        Thank you for using Stock Market App!
        
        Best regards,
        The Stock Market App Team
      `
    });
    
    return true;
  } catch (error) {
    console.error('Error sending transaction email:', error);
    return false;
  }
};