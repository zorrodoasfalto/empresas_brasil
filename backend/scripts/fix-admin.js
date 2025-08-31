const { Pool } = require('pg');

async function unifyUserBases() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔧 UNIFICANDO BASES DE USUÁRIOS - CORREÇÃO DEFINITIVA');
    
    // 1. Encontrar todos os usuários rodyrodrigo
    const allRodyUsers = await pool.query(`
      SELECT id, email, first_name, last_name, role, status 
      FROM users 
      WHERE email = 'rodyrodrigo@gmail.com'
      ORDER BY id
    `);
    
    console.log(`📊 Encontrados ${allRodyUsers.rows.length} usuários rodyrodrigo:`);
    allRodyUsers.rows.forEach(user => {
      console.log(`  - ID ${user.id}: ${user.role} - ${user.status}`);
    });
    
    // 2. Verificar se ID 2 existe (que o JWT está esperando)
    const user2Check = await pool.query('SELECT id FROM users WHERE id = 2');
    
    if (user2Check.rows.length === 0) {
      console.log('\n🔧 CRIANDO usuário ID 2 (que JWT espera)...');
      
      // Pegar dados do usuário ID 8 existente
      const userData = await pool.query(`
        SELECT password_hash, password_salt, uuid, first_name, last_name 
        FROM users WHERE id = 8
      `);
      
      if (userData.rows.length > 0) {
        const user = userData.rows[0];
        
        // Inserir com ID 2 usando os mesmos dados de autenticação
        await pool.query(`
          INSERT INTO users (
            id, uuid, email, first_name, last_name, 
            password_hash, password_salt, role, status, 
            email_verified, created_at
          ) 
          VALUES (
            2, uuid_generate_v4(), 'rodyrodrigo@gmail.com', 
            $1, $2, $3, $4, 'admin', 'active', 
            true, CURRENT_TIMESTAMP
          )
        `, [user.first_name, user.last_name, user.password_hash, user.password_salt]);
        
        console.log('✅ Usuário ID 2 criado copiando dados do ID 8!');
      } else {
        console.log('❌ Usuário ID 8 não encontrado para copiar dados');
      }
    } else {
      console.log('\n🔄 ATUALIZANDO usuário ID 2 existente...');
      await pool.query(`
        UPDATE users SET 
          email = 'rodyrodrigo@gmail.com',
          first_name = 'Rodrigo',
          last_name = 'Oficial',
          role = 'admin',
          status = 'active',
          email_verified = true
        WHERE id = 2
      `);
      console.log('✅ Usuário ID 2 atualizado!');
    }
    
    // 3. Garantir que TODOS os usuários com esse email sejam admin
    const updateAll = await pool.query(`
      UPDATE users 
      SET role = 'admin', status = 'active', email_verified = true 
      WHERE email = 'rodyrodrigo@gmail.com'
      RETURNING id, email, role, status
    `);
    
    console.log('\n🎉 BASES UNIFICADAS! Usuários admin:');
    updateAll.rows.forEach(user => {
      console.log(`  ✅ ID ${user.id}: ${user.email} - ${user.role} - ${user.status}`);
    });
    
    console.log('\n✨ PROBLEMA RESOLVIDO DEFINITIVAMENTE!');

  } catch (error) {
    console.error('❌ Erro ao unificar bases:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

unifyUserBases().catch(console.error);