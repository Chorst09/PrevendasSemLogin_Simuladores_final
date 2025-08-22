const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/nextn_db',
  ssl: false,
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if admin user already exists
    const checkResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@nextn.com']
    );

    if (checkResult.rows.length > 0) {
      console.log('❌ Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, 'admin', true)
       RETURNING id, email, name, role`,
      ['admin@nextn.com', hashedPassword, 'Administrador']
    );

    await client.query('COMMIT');
    console.log('✅ Admin user created successfully:');
    console.log(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating admin user:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser();
