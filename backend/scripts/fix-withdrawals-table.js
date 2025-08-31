const { Pool } = require('pg');

async function fixWithdrawalsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔧 CORRIGINDO TABELA DE WITHDRAWALS PARA SER SIMPLES');
    console.log('='.repeat(50));
    
    // Verificar se coluna user_id já existe
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'affiliate_withdrawals' AND column_name = 'user_id'
    `);
    
    if (columnCheck.rows.length === 0) {
      // Adicionar coluna user_id
      await pool.query('ALTER TABLE affiliate_withdrawals ADD COLUMN user_id INTEGER');
      console.log('✅ Coluna user_id adicionada');
    } else {
      console.log('✅ Coluna user_id já existe');
    }
    
    // Remover restrição NOT NULL do affiliate_id
    await pool.query('ALTER TABLE affiliate_withdrawals ALTER COLUMN affiliate_id DROP NOT NULL');
    console.log('✅ Restrição NOT NULL removida de affiliate_id');
    
    // Limpar dados antigos
    await pool.query('DELETE FROM affiliate_withdrawals');
    console.log('🗑️ Dados antigos removidos');
    
    console.log('✅ Tabela corrigida - pronta para usar user_id diretamente!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixWithdrawalsTable();
}

module.exports = { fixWithdrawalsTable };