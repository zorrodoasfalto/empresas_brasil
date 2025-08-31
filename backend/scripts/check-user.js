const { Pool } = require('pg');

async function checkUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Verificando usuários rodyrodrigo@gmail.com...');
    
    // Buscar TODOS os usuários com esse email
    const allUsers = await pool.query(
      `SELECT id, uuid, email, first_name, last_name, role, status, created_at 
       FROM users 
       WHERE email = $1
       ORDER BY id`,
      ['rodyrodrigo@gmail.com']
    );

    console.log(`📊 Encontrados ${allUsers.rows.length} usuário(s):`);
    
    allUsers.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. Usuário ID ${user.id}:`);
      console.log({
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        createdAt: user.created_at
      });
    });

    // Verificar se há duplicatas
    if (allUsers.rows.length > 1) {
      console.log('\n⚠️  ATENÇÃO: Existem múltiplos usuários com o mesmo email!');
      console.log('🔧 Atualizando TODOS para role admin...');
      
      for (const user of allUsers.rows) {
        await pool.query(
          `UPDATE users SET role = 'admin' WHERE id = $1`,
          [user.id]
        );
        console.log(`✅ Usuário ID ${user.id} atualizado para admin`);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkUser().catch(console.error);