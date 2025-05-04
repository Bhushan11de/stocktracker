// backend/scripts/create-admin.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

async function createAdminUser() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'stock_market_app',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    // Generate a simple hashed password (admin123)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Delete existing admin user to avoid conflicts
    await pool.query('DELETE FROM users WHERE email = $1', ['admin@example.com']);
    
    // Create new admin
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      ['admin@example.com', hashedPassword, 'Admin', 'User', 'admin']
    );
    
    console.log('Admin user created successfully:', {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();