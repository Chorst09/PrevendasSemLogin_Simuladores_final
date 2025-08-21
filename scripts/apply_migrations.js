const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nextn_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Aplicando migração: Adicionando coluna password_change_required...');
    
    // Verificar se a coluna já existe
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_change_required'
    `;
    
    const { rows } = await client.query(checkColumnQuery);
    
    if (rows.length === 0) {
      // Adicionar a coluna se não existir
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN password_change_required BOOLEAN DEFAULT false
      `);
      
      // Definir como true para usuários existentes com role 'diretor' ou 'user'
      await client.query(`
        UPDATE users 
        SET password_change_required = true 
        WHERE role IN ('diretor', 'user')
      `);
      
      console.log('✅ Migração aplicada com sucesso!');
      console.log('   - Coluna password_change_required adicionada à tabela users');
      console.log('   - Usuários existentes com role "diretor" ou "user" precisarão alterar a senha no próximo login');
    } else {
      console.log('ℹ️ A coluna password_change_required já existe. Nenhuma alteração necessária.');
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao aplicar migração:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations()
  .then(() => {
    console.log('✅ Todas as migrações foram aplicadas com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  });
