const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetVictorPassword() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Buscando usuário Victor...');
    
    // Encontrar Victor
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      ['victormagalhaesg@gmail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuário Victor não encontrado');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ Victor encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Role atual:', user.role);
    
    // Nova senha
    const newPassword = 'VictorAdmin2025!';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('\n🔑 Atualizando senha e role...');
    
    // Atualizar senha e definir como admin
    await pool.query(
      'UPDATE users SET password_hash = $1, role = $2 WHERE id = $3',
      [hashedPassword, 'admin', user.id]
    );
    
    console.log('✅ SENHA E ROLE ATUALIZADOS COM SUCESSO!');
    console.log('');
    console.log('📋 CREDENCIAIS DO VICTOR:');
    console.log('   Email: victormagalhaesg@gmail.com');
    console.log('   Senha: VictorAdmin2025!');
    console.log('   Role: admin');
    console.log('');
    console.log('🎯 Victor agora é ADMIN e pode acessar o dashboard normalmente!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

resetVictorPassword();