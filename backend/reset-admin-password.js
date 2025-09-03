const { Pool } = require('pg');
const SecurityUtils = require('./utils/security');
require('dotenv').config();

async function resetAdminPassword() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const newPassword = '123456'; // Nova senha para rodyrodrigo@gmail.com
  
  try {
    console.log('🔄 Resetando senha do admin rodyrodrigo@gmail.com...');
    
    // Gerar novo hash da senha
    const { hash: passwordHash, salt: passwordSalt } = await SecurityUtils.hashPassword(newPassword);
    
    // Atualizar na tabela users
    const updateResult = await pool.query(
      `UPDATE users SET 
         password_hash = $1, 
         password_salt = $2, 
         updated_at = CURRENT_TIMESTAMP 
       WHERE email = $3`,
      [passwordHash, passwordSalt, 'rodyrodrigo@gmail.com']
    );
    
    if (updateResult.rowCount > 0) {
      console.log('✅ Senha atualizada com sucesso na tabela users');
      console.log('📧 Email: rodyrodrigo@gmail.com');
      console.log('🔑 Nova senha: 123456');
      console.log('💳 Créditos: 10000');
    } else {
      console.log('❌ Usuário não encontrado para atualização');
    }
    
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
  } finally {
    pool.end();
  }
}

resetAdminPassword();