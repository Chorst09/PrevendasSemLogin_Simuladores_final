const { Pool } = require('pg');

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nextn_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addProposalNumberColumn() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Aplicando migração: Adicionando coluna proposal_number...');

    // Verificar se a coluna já existe
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'proposals' AND column_name = 'proposal_number'
    `;

    const { rows } = await client.query(checkColumnQuery);

    if (rows.length === 0) {
      // Adicionar a coluna se não existir
      await client.query(`
        ALTER TABLE proposals
        ADD COLUMN proposal_number VARCHAR(255)
      `);

      console.log('✅ Migração aplicada com sucesso!');
      console.log('   - Coluna proposal_number adicionada à tabela proposals');
    } else {
      console.log('ℹ️ A coluna proposal_number já existe. Nenhuma alteração necessária.');
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

addProposalNumberColumn()
  .then(() => {
    console.log('✅ Migração para adicionar proposal_number foi aplicada com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar migração:', error);
    process.exit(1);
  });
