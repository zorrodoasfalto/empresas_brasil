const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testDirectDB() {
  try {
    console.log('🔍 VERIFICANDO CRÉDITOS DIRETAMENTE NO BANCO');
    console.log('=' .repeat(50));
    
    // Verificar créditos do Victor
    const result = await pool.query(
      'SELECT id, email, role, credits FROM simple_users WHERE email = $1',
      ['victormagalhaesg@gmail.com']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ USUÁRIO ENCONTRADO:');
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Créditos: ${user.credits}`);
      
      if (user.credits === 10000) {
        console.log('\n✅ CRÉDITOS CORRETOS: 10.000 confirmado no banco!');
      } else {
        console.log('\n❌ CRÉDITOS INCORRETOS! Esperado 10.000, encontrado:', user.credits);
      }
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
    // Testar qual endpoint o frontend usa para créditos
    console.log('\n🔍 VERIFICANDO TODOS OS ENDPOINTS DE CRÉDITOS...');
    console.log('O frontend deve estar chamando /api/credits');
    console.log('ID do usuário para token JWT: 39');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testDirectDB();