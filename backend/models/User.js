const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  static async create(userData) {
    try {
      const { email, password, firstName, lastName, role = 'user' } = userData;
      
      console.log(`Creating new user with email: ${email}`);
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const query = `
        INSERT INTO users (email, password, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, role, created_at
      `;
      
      const values = [
        email.toLowerCase().trim(), 
        hashedPassword, 
        firstName.trim(), 
        lastName.trim(), 
        role
      ];
      
      const result = await db.query(query, values);
      console.log(`User created with ID: ${result.rows[0].id}`);
      
      return result.rows[0];
    } catch (error) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505') {
        console.error(`User creation failed: Email ${userData.email} already exists`);
        throw new Error('User with this email already exists');
      }
      
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await db.query(query, [email.toLowerCase().trim()]);
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error finding user by email: ${email}`, error);
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const query = 'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1';
      const result = await db.query(query, [id]);
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error finding user by ID: ${id}`, error);
      throw error;
    }
  }
  
  static async updatePassword(id, newPassword) {
    try {
      console.log(`Updating password for user ID: ${id}`);
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const query = `
        UPDATE users
        SET password = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, email, first_name, last_name, role
      `;
      
      const result = await db.query(query, [hashedPassword, id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating password for user ID: ${id}`, error);
      throw error;
    }
  }
  
  static async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw error;
    }
  }
  
  static async createPasswordResetToken(email) {
    try {
      console.log(`Creating password reset token for email: ${email}`);
      
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
        email.toLowerCase().trim()
      ]);
      
      if (result.rows.length === 0) {
        console.log(`No user found with email: ${email}`);
        return null;
      }
      
      console.log(`Reset token created for user ID: ${result.rows[0].id}`);
      return resetToken;
    } catch (error) {
      console.error(`Error creating reset token for email: ${email}`, error);
      throw error;
    }
  }
  
  static async findByResetToken(token) {
    try {
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
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw error;
    }
  }
  
  static async resetPassword(userId, newPassword) {
    try {
      console.log(`Resetting password for user ID: ${userId}`);
      
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
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      console.log(`Password reset successful for user ID: ${userId}`);
      return result.rows[0];
    } catch (error) {
      console.error(`Error resetting password for user ID: ${userId}`, error);
      throw error;
    }
  }
  
  static async getAllUsers() {
    try {
      console.log('Getting all users');
      
      const query = `
        SELECT id, email, first_name, last_name, role, created_at
        FROM users
        ORDER BY created_at DESC
      `;
      
      const result = await db.query(query);
      console.log(`Found ${result.rows.length} users`);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Admin-specific functions
  static async updateUserRole(userId, role) {
    try {
      console.log(`Updating role for user ID ${userId} to ${role}`);
      
      // Validate role
      if (!['admin', 'user'].includes(role)) {
        throw new Error('Invalid role. Must be either admin or user.');
      }
      
      const query = `
        UPDATE users
        SET role = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, email, first_name, last_name, role
      `;
      
      const result = await db.query(query, [role, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating role for user ID: ${userId}`, error);
      throw error;
    }
  }
  
  static async deleteUser(userId) {
    try {
      console.log(`Deleting user with ID: ${userId}`);
      
      const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id
      `;
      
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      console.log(`User ${userId} deleted successfully`);
      return result.rows[0];
    } catch (error) {
      console.error(`Error deleting user ID: ${userId}`, error);
      throw error;
    }
  }
  
  static async countUsersByRole() {
    try {
      const query = `
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      `;
      
      const result = await db.query(query);
      
      // Format the result into a more usable object
      const roleCounts = {};
      result.rows.forEach(row => {
        roleCounts[row.role] = parseInt(row.count);
      });
      
      return roleCounts;
    } catch (error) {
      console.error('Error counting users by role:', error);
      throw error;
    }
  }
  
  static async getNewUsers(days = 30) {
    try {
      console.log(`Getting users created in the last ${days} days`);
      
      const query = `
        SELECT id, email, first_name, last_name, role, created_at
        FROM users
        WHERE created_at > NOW() - INTERVAL '${days} days'
        ORDER BY created_at DESC
      `;
      
      const result = await db.query(query);
      console.log(`Found ${result.rows.length} new users in the last ${days} days`);
      
      return result.rows;
    } catch (error) {
      console.error(`Error getting new users for the last ${days} days:`, error);
      throw error;
    }
  }
  
  // New method to get user stats
  static async getUserStats() {
    try {
      const totalQuery = `SELECT COUNT(*) as total FROM users`;
      const totalResult = await db.query(totalQuery);
      
      const roleQuery = `
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      `;
      const roleResult = await db.query(roleQuery);
      
      const newUsersQuery = `
        SELECT COUNT(*) as count
        FROM users
        WHERE created_at > NOW() - INTERVAL '30 days'
      `;
      const newUsersResult = await db.query(newUsersQuery);
      
      return {
        totalUsers: parseInt(totalResult.rows[0].total),
        roleCounts: roleResult.rows.reduce((acc, row) => {
          acc[row.role] = parseInt(row.count);
          return acc;
        }, {}),
        newUsersLast30Days: parseInt(newUsersResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

module.exports = User;