// backend/utils/seedAdmin.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create admin user if it doesn't exist
const seedAdmin = async () => {
  try {
    // Check if admin user already exists
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      console.log('Creating admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('admin123', salt);
      
      // Create admin user
      const query = `
        INSERT INTO users (email, password, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, role
      `;
      
      const db = require('../config/db');
      
      await db.query(query, [
        adminEmail,
        password,
        'Admin',
        'User',
        'admin'
      ]);
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = seedAdmin;