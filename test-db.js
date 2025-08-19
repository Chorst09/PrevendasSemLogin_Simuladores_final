const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/nextn_db',
  ssl: false,
});

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    
    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conexão com banco estabelecida');
    
    // Testar query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query de teste executada:', result.rows[0]);
    
    // Buscar usuário admin
    const userResult = await client.query(
      'SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = $1',
      ['admin@nextn.com']
    );
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('✅ Usuário encontrado:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active
      });
      
      // Testar verificação de senha
      const isValidPassword = await bcrypt.compare('admin123', user.password_hash);
      console.log('🔐 Senha válida:', isValidPassword);
      
    } else {
      console.log('❌ Usuário admin não encontrado');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

testConnection();