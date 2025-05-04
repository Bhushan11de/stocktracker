const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ 
  path: path.resolve(process.cwd(), '.env') 
});

async function checkAndCreateAdminUser() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    // Check existing admin users
    const existingAdmins = await pool.query(`
      SELECT id, email, first_name, last_name, role 
      FROM users 
      WHERE role = 'admin'
    `);

    if (existingAdmins.rows.length > 0) {
      console.log('Existing Admin Users:');
      existingAdmins.rows.forEach(admin => {
        console.log({
          id: admin.id,
          email: admin.email,
          name: `${admin.first_name} ${admin.last_name}`,
          role: admin.role
        });
      });
      return;
    }

    // If no admin exists, create a new admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const newAdminResult = await pool.query(`
      INSERT INTO users 
      (email, password, first_name, last_name, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [
      'admin@stockmarket.com', 
      hashedPassword, 
      'Stock', 
      'Admin', 
      'admin'
    ]);

    console.log('\n--- ADMIN USER CREATED ---');
    console.log('Admin Credentials:');
    console.log('Email: admin@stockmarket.com');
    console.log('Password: admin123');
    console.log('--- IMPORTANT: Change this password immediately after first login! ---');

  } catch (error) {
    console.error('Error checking/creating admin user:', error);
  } finally {
    await pool.end();
  }
}

checkAndCreateAdminUser();