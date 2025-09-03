const { Pool } = require('pg');
const SecurityUtils = require('./utils/security');
require('dotenv').config();

async function resetVictor() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Resetando Victor...');
    
    const email = 'victormagalhaesg@gmail.com';
    const newPassword = 'VictorAdmin2025!';
    
    // Hash da nova senha
    const { hash, salt } = await SecurityUtils.hashPassword(newPassword);
    
    // Atualizar senha e role
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, password_salt = $2, role = $3 WHERE email = $4 RETURNING id, email, role',
      [hash, salt, 'admin', email]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ VICTOR ATUALIZADO COM SUCESSO!');
      console.log('');
      console.log('📋 CREDENCIAIS DO VICTOR:');
      console.log('   Email:', email);
      console.log('   Senha:', newPassword);
      console.log('   Role: admin');
      console.log('   ID:', result.rows[0].id);
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

resetVictor();