const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixVictorCredits() {
  try {
    console.log('🔧 ATUALIZANDO CRÉDITOS DE victormagalhaesg@gmail.com PARA 10.000');
    
    const email = 'victormagalhaesg@gmail.com';
    
    // Atualizar em simple_users
    await pool.query(
      'UPDATE simple_users SET credits = $1 WHERE email = $2',
      [10000, email]
    );
    
    // Verificar se foi atualizado
    const result = await pool.query(
      'SELECT id, email, role, credits FROM simple_users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ CRÉDITOS ATUALIZADOS COM SUCESSO!');
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Créditos: ${user.credits}`);
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

fixVictorCredits();