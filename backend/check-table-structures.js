const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTableStructures() {
  try {
    console.log('🔍 VERIFICANDO ESTRUTURA DAS TABELAS DE USUÁRIOS');
    console.log('=' .repeat(60));
    
    const tables = ['simple_users', 'users', 'user_profiles'];
    
    for (const table of tables) {
      console.log(`\n📋 Tabela: ${table}`);
      try {
        const structure = await pool.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [table]);
        
        if (structure.rows.length > 0) {
          console.log('   ✅ Colunas encontradas:');
          structure.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
          });
        } else {
          console.log('   ❌ Tabela não existe');
        }
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
    
    // Verificar Victor especificamente
    console.log('\n🔍 VERIFICANDO VICTOR EM CADA TABELA:');
    
    const email = 'victormagalhaesg@gmail.com';
    
    // simple_users
    try {
      const simpleUser = await pool.query('SELECT * FROM simple_users WHERE email = $1', [email]);
      console.log('\n📋 simple_users:');
      if (simpleUser.rows.length > 0) {
        console.log('   ✅ Victor encontrado:', JSON.stringify(simpleUser.rows[0], null, 2));
      } else {
        console.log('   ❌ Victor não encontrado');
      }
    } catch (error) {
      console.log('\n📋 simple_users: ❌ Erro:', error.message);
    }
    
    // users
    try {
      const oldUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      console.log('\n📋 users:');
      if (oldUser.rows.length > 0) {
        console.log('   ✅ Victor encontrado:', JSON.stringify(oldUser.rows[0], null, 2));
      } else {
        console.log('   ❌ Victor não encontrado');
      }
    } catch (error) {
      console.log('\n📋 users: ❌ Erro:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructures();