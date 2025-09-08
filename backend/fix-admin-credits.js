const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixAdminCredits() {
  try {
    console.log('🔧 CORRIGINDO CRÉDITOS DO ADMIN victormagalhaesg@gmail.com');
    console.log('=' .repeat(70));
    
    const adminEmail = 'victormagalhaesg@gmail.com';
    
    // 1. Verificar usuário em simple_users
    console.log('🔍 1. Verificando usuário em simple_users...');
    const simpleUser = await pool.query(
      'SELECT id, email, role, credits FROM simple_users WHERE email = $1',
      [adminEmail]
    );
    
    if (simpleUser.rows.length > 0) {
      const user = simpleUser.rows[0];
      console.log(`   ✅ Encontrado em simple_users:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Créditos atuais: ${user.credits}`);
      
      if (user.role === 'admin' && user.credits !== 10000) {
        console.log('\n🔧 2. Corrigindo créditos do admin...');
        await pool.query(
          'UPDATE simple_users SET credits = $1 WHERE email = $2',
          [10000, adminEmail]
        );
        console.log('   ✅ Créditos atualizados para 10.000!');
        
        // Verificar se foi atualizado
        const updatedUser = await pool.query(
          'SELECT credits FROM simple_users WHERE email = $1',
          [adminEmail]
        );
        console.log(`   ✅ Confirmado: Créditos agora são ${updatedUser.rows[0].credits}`);
      } else if (user.role === 'admin' && user.credits === 10000) {
        console.log('\n✅ Créditos já estão corretos (10.000) para o admin!');
      } else {
        console.log(`\n⚠️  Usuário não é admin (role: ${user.role})`);
      }
    } else {
      console.log('   ❌ Usuário não encontrado em simple_users');
    }
    
    // 2. Verificar usuário em users (tabela antiga)
    console.log('\n🔍 3. Verificando usuário em users (tabela antiga)...');
    const oldUser = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (oldUser.rows.length > 0) {
      console.log(`   ✅ Encontrado em users: ${oldUser.rows[0].email}, role: ${oldUser.rows[0].role}`);
    } else {
      console.log('   ❌ Usuário não encontrado em users');
    }
    
    // 3. Verificar log de uso de créditos recente
    console.log('\n🔍 4. Últimas 5 operações de crédito...');
    const recentUsage = await pool.query(`
      SELECT user_id, search_type, credits_used, search_query, timestamp 
      FROM usage_log 
      WHERE user_id = (SELECT id FROM simple_users WHERE email = $1)
      ORDER BY timestamp DESC 
      LIMIT 5
    `, [adminEmail]);
    
    if (recentUsage.rows.length > 0) {
      console.log('   📋 Últimas operações:');
      recentUsage.rows.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.search_type} - ${log.credits_used} créditos - ${log.timestamp}`);
        if (log.search_query) {
          console.log(`      Query: ${log.search_query.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('   ❌ Nenhum log de uso encontrado');
    }
    
    // 4. Investigar possível bug
    console.log('\n🔍 5. Investigando possíveis bugs no sistema de créditos...');
    
    // Verificar se há alguma lógica que reduz créditos incorretamente
    console.log('   📋 Sugestões para prevenir o bug:');
    console.log('   - ✅ Admin deve ter créditos ilimitados (não serem decrementados)');
    console.log('   - ✅ Verificar se middleware checkUserAccess está correto');
    console.log('   - ✅ Verificar se endpoint de busca não decrementa créditos para admin');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

fixAdminCredits();