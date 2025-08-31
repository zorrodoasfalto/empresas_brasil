const { Pool } = require('pg');

async function checkSimpleUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 PROBLEMA ENCONTRADO: simple_users vs users');
    console.log('='.repeat(50));
    
    // Verificar se simple_users existe
    const simpleUsersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'simple_users'
      )
    `);
    
    console.log(`📊 Tabela simple_users existe: ${simpleUsersCheck.rows[0].exists}`);
    
    if (simpleUsersCheck.rows[0].exists) {
      // Listar usuários na simple_users
      const simpleUsers = await pool.query(`
        SELECT id, email, name FROM simple_users ORDER BY id
      `);
      
      console.log(`\n👥 Usuários em simple_users (${simpleUsers.rows.length}):`);
      simpleUsers.rows.forEach(user => {
        console.log(`  - ID ${user.id}: ${user.email} (${user.name})`);
      });
      
      // Verificar específico rodyrodrigo em simple_users
      const rodySimple = await pool.query(`
        SELECT * FROM simple_users WHERE email = 'rodyrodrigo@gmail.com'
      `);
      
      if (rodySimple.rows.length > 0) {
        console.log(`\n🎯 rodyrodrigo@gmail.com em simple_users:`);
        console.log(`   ID: ${rodySimple.rows[0].id}`);
        console.log(`   Email: ${rodySimple.rows[0].email}`);
        console.log(`   Nome: ${rodySimple.rows[0].name}`);
      } else {
        console.log(`\n❌ rodyrodrigo@gmail.com NÃO está em simple_users`);
      }
    }
    
    // Comparar com users
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Usuários em users: ${usersCount.rows[0].count}`);
    
    const rodyUsers = await pool.query(`
      SELECT id, email, first_name, last_name, role FROM users 
      WHERE email = 'rodyrodrigo@gmail.com'
    `);
    
    if (rodyUsers.rows.length > 0) {
      console.log(`\n🎯 rodyrodrigo@gmail.com em users:`);
      rodyUsers.rows.forEach(user => {
        console.log(`   ID: ${user.id} - ${user.first_name} ${user.last_name} - ${user.role}`);
      });
    }
    
    console.log('\n💡 SOLUÇÃO:');
    console.log('   O backend está usando simple_users para login, mas users para dados');
    console.log('   Precisa sincronizar ou corrigir o endpoint de login');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkSimpleUsers().catch(console.error);