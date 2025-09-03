const { Pool } = require('pg');
require('dotenv').config();

async function checkVictor() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Buscando usuário victormagalhaes...');
    
    // Verificar na tabela users
    const userResult = await pool.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE email ILIKE $1',
      ['%victormagalhaes%']
    );
    
    if (userResult.rows.length > 0) {
      console.log('✅ Encontrado na tabela users:');
      userResult.rows.forEach(user => {
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Nome:', user.first_name, user.last_name);
        console.log('   Role:', user.role);
        console.log('   ---');
      });
    } else {
      console.log('❌ Usuário não encontrado na tabela users');
    }
    
    // Verificar na tabela simple_users também
    const simpleUserResult = await pool.query(
      'SELECT id, email, role, first_name, last_name FROM simple_users WHERE email ILIKE $1',
      ['%victormagalhaes%']
    );
    
    if (simpleUserResult.rows.length > 0) {
      console.log('✅ Encontrado na tabela simple_users:');
      simpleUserResult.rows.forEach(user => {
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Nome:', user.first_name, user.last_name);
        console.log('   Role:', user.role);
        console.log('   ---');
      });
    } else {
      console.log('❌ Usuário não encontrado na tabela simple_users');
    }
    
    // Buscar por qualquer email com victor
    console.log('\n🔍 Buscando qualquer usuário com "victor" no email...');
    const allVictorResult = await pool.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1',
      ['%victor%']
    );
    
    if (allVictorResult.rows.length > 0) {
      console.log('📋 Usuários encontrados com "victor":');
      allVictorResult.rows.forEach(user => {
        console.log(`   ${user.email} - ${user.first_name} ${user.last_name} - Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

checkVictor();