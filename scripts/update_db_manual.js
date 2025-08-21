const { Pool } = require('pg');

// Configuração do banco de dados
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'nextn_db',
  user: 'postgres',
  password: 'password'
});

async function updateDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Remover constraint antiga
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    console.log('Constraint antiga removida com sucesso');
    
    // Adicionar nova constraint com 'diretor'
    await pool.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user', 'diretor'))");
    console.log('Nova constraint adicionada com sucesso');
    
    console.log('Banco de dados atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar banco de dados:', error);
  } finally {
    await pool.end();
  }
}

updateDatabase();
