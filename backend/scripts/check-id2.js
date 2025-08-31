const { Pool } = require('pg');

async function checkUserById() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Verificando usuário ID 2...');
    
    const user2 = await pool.query(
      `SELECT id, uuid, email, first_name, last_name, role, status, created_at 
       FROM users 
       WHERE id = 2`,
      []
    );

    if (user2.rows.length > 0) {
      console.log('👤 Usuário ID 2 encontrado:');
      console.log(user2.rows[0]);
      
      // Atualizar também para admin
      await pool.query(
        `UPDATE users SET role = 'admin' WHERE id = 2`,
        []
      );
      console.log('✅ Usuário ID 2 atualizado para admin também!');
    } else {
      console.log('❌ Usuário ID 2 não existe');
    }

    console.log('\n🔍 Verificando todos os usuários rodyrodrigo:');
    const allRody = await pool.query(
      `SELECT id, email, role, status FROM users WHERE email LIKE '%rodyrodrigo%'`,
      []
    );
    
    allRody.rows.forEach(user => {
      console.log(`ID ${user.id}: ${user.email} - ${user.role} - ${user.status}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkUserById().catch(console.error);