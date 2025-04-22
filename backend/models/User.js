// backend/models/User.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  static async create(userData) {
    const { email, password, firstName, lastName, role = 'user' } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, created_at
    `;
    
    const values = [email, hashedPassword, firstName, lastName, role];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    
    return result.rows[0];
  }
  
  static async findById(id) {
    const query = 'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    
    return result.rows[0];
  }
  
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const query = `
      UPDATE users
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, first_name, last_name, role
    `;
    
    const result = await db.query(query, [hashedPassword, id]);
    
    return result.rows[0];
  }
  
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
  
  static async createPasswordResetToken(email) {
    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set token expiry (10 minutes)
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    // Update user with reset token
    const query = `
      UPDATE users
      SET reset_password_token = $1,
          reset_password_expires = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = $3
      RETURNING id
    `;
    
    const result = await db.query(query, [
      resetPasswordToken,
      resetPasswordExpires,
      email
    ]);
    
    return result.rows.length > 0 ? resetToken : null;
  }
  
  static async findByResetToken(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const query = `
      SELECT id, email
      FROM users
      WHERE reset_password_token = $1
      AND reset_password_expires > CURRENT_TIMESTAMP
    `;
    
    const result = await db.query(query, [hashedToken]);
    
    return result.rows[0];
  }
  
  static async resetPassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const query = `
      UPDATE users
      SET password = $1,
          reset_password_token = NULL,
          reset_password_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email
    `;
    
    const result = await db.query(query, [hashedPassword, userId]);
    
    return result.rows[0];
  }
  
  static async getAllUsers() {
    const query = `
      SELECT id, email, first_name, last_name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query);
    
    return result.rows;
  }

  // Admin-specific functions
  static async updateUserRole(userId, role) {
    const query = `
      UPDATE users
      SET role = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, first_name, last_name, role
    `;
    
    const result = await db.query(query, [role, userId]);
    
    return result.rows[0];
  }
  
  static async deleteUser(userId) {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await db.query(query, [userId]);
    
    return result.rows[0];
  }
  
  static async countUsersByRole() {
    const query = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;
    
    const result = await db.query(query);
    
    return result.rows;
  }
  
  static async getNewUsers(days = 30) {
    const query = `
      SELECT id, email, first_name, last_name, role, created_at
      FROM users
      WHERE created_at > NOW() - INTERVAL '${days} days'
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query);
    
    return result.rows;
  }
}

module.exports = User;