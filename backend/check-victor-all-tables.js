const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkVictorAllTables() {
  try {
    console.log('🔍 VERIFICANDO VICTOR EM TODAS AS TABELAS');
    console.log('=' .repeat(60));
    
    const email = 'victormagalhaesg@gmail.com';
    
    // 1. Verificar em simple_users
    console.log('📋 1. Tabela simple_users:');
    const simpleUser = await pool.query(
      'SELECT id, email, role, credits, password_hash FROM simple_users WHERE email = $1',
      [email]
    );
    
    if (simpleUser.rows.length > 0) {
      const user = simpleUser.rows[0];
      console.log('   ✅ Encontrado:');
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Créditos: ${user.credits}`);
      console.log(`   - Tem senha: ${user.password_hash ? 'SIM' : 'NÃO'}`);
    } else {
      console.log('   ❌ Não encontrado');
    }
    
    // 2. Verificar em users (tabela antiga)
    console.log('\n📋 2. Tabela users:');
    const oldUser = await pool.query(
      'SELECT id, email, role, password_hash FROM users WHERE email = $1',
      [email]
    );
    
    if (oldUser.rows.length > 0) {
      const user = oldUser.rows[0];
      console.log('   ✅ Encontrado:');
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Tem senha: ${user.password_hash ? 'SIM' : 'NÃO'}`);
    } else {
      console.log('   ❌ Não encontrado');
    }
    
    // 3. Verificar em user_profiles
    console.log('\n📋 3. Tabela user_profiles:');
    const userProfile = await pool.query(
      'SELECT id, email, credits, password_hash FROM user_profiles WHERE email = $1',
      [email]
    );
    
    if (userProfile.rows.length > 0) {
      const user = userProfile.rows[0];
      console.log('   ✅ Encontrado:');
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Créditos: ${user.credits}`);
      console.log(`   - Tem senha: ${user.password_hash ? 'SIM' : 'NÃO'}`);
    } else {
      console.log('   ❌ Não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkVictorAllTables();