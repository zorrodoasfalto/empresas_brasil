const { Pool } = require('pg');

async function makeUserAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔧 Conectando ao banco de dados...');
    
    // Verificar se o usuário existe
    const userCheck = await pool.query(
      'SELECT id, email, role, status FROM users WHERE email = $1',
      ['rodyrodrigo@gmail.com']
    );

    if (userCheck.rows.length === 0) {
      console.log('❌ Usuário rodyrodrigo@gmail.com não encontrado');
      return;
    }

    const user = userCheck.rows[0];
    console.log('👤 Usuário encontrado:', {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    });

    // Atualizar para ADMIN
    const updateResult = await pool.query(
      `UPDATE users 
       SET role = 'admin', 
           updated_at = CURRENT_TIMESTAMP 
       WHERE email = $1 
       RETURNING id, email, role, status`,
      ['rodyrodrigo@gmail.com']
    );

    if (updateResult.rows.length > 0) {
      const updatedUser = updateResult.rows[0];
      console.log('✅ Usuário atualizado para ADMIN:');
      console.log({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status
      });
      console.log('🎉 rodyrodrigo@gmail.com agora é ADMINISTRADOR!');
    } else {
      console.log('❌ Falha ao atualizar usuário');
    }

  } catch (error) {
    console.error('❌ Erro ao fazer usuário ADMIN:', error);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com banco encerrada');
  }
}

// Executar
makeUserAdmin().catch(console.error);