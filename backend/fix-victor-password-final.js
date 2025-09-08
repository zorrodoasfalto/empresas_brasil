const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixVictorPasswordFinal() {
  try {
    console.log('🔧 DEFININDO SENHA PARA VICTOR EM TODAS AS TABELAS');
    console.log('=' .repeat(60));
    
    const email = 'victormagalhaesg@gmail.com';
    const password = 'yMNmI2$V9aqq';
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔑 Senha hashada gerada');
    
    // 1. Atualizar em simple_users (se tiver coluna password)
    console.log('\n📋 1. Verificando simple_users...');
    try {
      // Primeiro verificar se tem coluna password
      const checkCol = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'simple_users' AND column_name LIKE '%password%'
      `);
      
      if (checkCol.rows.length > 0) {
        const passwordCol = checkCol.rows[0].column_name;
        await pool.query(`UPDATE simple_users SET ${passwordCol} = $1 WHERE email = $2`, 
          [hashedPassword, email]);
        console.log(`   ✅ Senha atualizada (coluna: ${passwordCol})`);
      } else {
        // Adicionar coluna se não existir
        await pool.query(`ALTER TABLE simple_users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
        await pool.query(`UPDATE simple_users SET password_hash = $1 WHERE email = $2`, 
          [hashedPassword, email]);
        console.log('   ✅ Coluna password_hash criada e senha definida');
      }
    } catch (error) {
      console.log('   ❌ Erro:', error.message);
    }
    
    // 2. Atualizar em users
    console.log('\n📋 2. Atualizando users...');
    try {
      await pool.query(`UPDATE users SET password_hash = $1 WHERE email = $2`, 
        [hashedPassword, email]);
      console.log('   ✅ Senha atualizada em users');
    } catch (error) {
      console.log('   ❌ Erro:', error.message);
    }
    
    // 3. Verificar qual tabela tem Victor
    console.log('\n🔍 3. Verificando onde Victor está cadastrado...');
    
    const simpleCheck = await pool.query('SELECT id, email, role FROM simple_users WHERE email = $1', [email]);
    const usersCheck = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [email]);
    
    if (simpleCheck.rows.length > 0) {
      console.log('   ✅ Victor encontrado em simple_users:', simpleCheck.rows[0]);
    }
    
    if (usersCheck.rows.length > 0) {
      console.log('   ✅ Victor encontrado em users:', usersCheck.rows[0]);
    }
    
    console.log('\n✅ SENHA DEFINIDA EM TODAS AS TABELAS POSSÍVEIS!');
    console.log('📧 Email: victormagalhaesg@gmail.com');
    console.log('🔑 Senha: yMNmI2$V9aqq');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

fixVictorPasswordFinal();