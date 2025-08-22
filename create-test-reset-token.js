const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/nextn_db',
  ssl: false,
});

async function createTestResetToken() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get the admin user ID
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@nextn.com']
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }

    const userId = userResult.rows[0].id;
    
    // Delete any existing tokens for this user
    await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
    
    // Create a test token (for demo purposes only - in production, this would be a secure random token)
    const testToken = 'test-reset-token';
    const hashedToken = crypto.createHash('sha256').update(testToken).digest('hex');
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Insert the test token
    await client.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, hashedToken, expiresAt]
    );

    await client.query('COMMIT');
    console.log('✅ Test reset token created successfully');
    console.log('Reset URL:', `http://localhost:3000/reset-password?token=${testToken}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating test reset token:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestResetToken();
