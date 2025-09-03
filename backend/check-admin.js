const { Pool } = require('pg');
require('dotenv').config();

async function checkAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Buscando usuário rodyrodrigo@gmail.com...');
    
    // Verificar na tabela users
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      ['rodyrodrigo@gmail.com']
    );
    
    if (userResult.rows.length > 0) {
      console.log('✅ Encontrado na tabela users:');
      console.log('   ID:', userResult.rows[0].id);
      console.log('   Email:', userResult.rows[0].email);
      console.log('   Role:', userResult.rows[0].role);
      
      // Verificar créditos
      const creditsResult = await pool.query(
        'SELECT credits, plan FROM user_credits WHERE user_id = $1',
        [userResult.rows[0].id]
      );
      
      if (creditsResult.rows.length > 0) {
        console.log('💳 Créditos:', creditsResult.rows[0].credits);
        console.log('📋 Plano:', creditsResult.rows[0].plan);
      } else {
        console.log('❌ Sem créditos cadastrados');
      }
    } else {
      console.log('❌ Usuário não encontrado na tabela users');
    }
    
    // Verificar na tabela simple_users também
    const simpleUserResult = await pool.query(
      'SELECT id, email, role FROM simple_users WHERE email = $1',
      ['rodyrodrigo@gmail.com']
    );
    
    if (simpleUserResult.rows.length > 0) {
      console.log('✅ Encontrado na tabela simple_users:');
      console.log('   ID:', simpleUserResult.rows[0].id);
      console.log('   Email:', simpleUserResult.rows[0].email);
      console.log('   Role:', simpleUserResult.rows[0].role);
    } else {
      console.log('❌ Usuário não encontrado na tabela simple_users');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

checkAdmin();