const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function testSignup() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:password@localhost:5432/nextn_db',
  });

  try {
    console.log('Testing database connection...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✓ Database connected');
    
    // Test password hashing
    console.log('Testing password hashing...');
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✓ Password hashed successfully');
    
    // Test user insertion
    console.log('Testing user insertion...');
    const testEmail = `test${Date.now()}@example.com`;
    const result = await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
      ['Test User', testEmail, hashedPassword]
    );
    
    console.log('✓ User created successfully:', result.rows[0]);
    
    // Cleanup
    await client.query('DELETE FROM users WHERE email = $1', [testEmail]);
    console.log('✓ Test user cleaned up');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('✗ Error:', error);
  }
}

testSignup();
