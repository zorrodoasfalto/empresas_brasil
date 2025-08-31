const { Pool } = require('pg');

async function fixRody() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🎯 CORRIGINDO USUÁRIO rodyrodrigo@gmail.com');
    console.log('='.repeat(40));
    
    // Verificar se rodyrodrigo existe em simple_users
    const rodySimple = await pool.query('SELECT * FROM simple_users WHERE email = $1', ['rodyrodrigo@gmail.com']);
    
    if (rodySimple.rows.length > 0) {
      const simpleUser = rodySimple.rows[0];
      console.log(`✅ Encontrado em simple_users: ID ${simpleUser.id} - ${simpleUser.name} - ${simpleUser.role}`);
      
      // Verificar se já existe em users
      const rodyUsers = await pool.query('SELECT * FROM users WHERE email = $1', ['rodyrodrigo@gmail.com']);
      
      if (rodyUsers.rows.length === 0) {
        console.log('❌ NÃO encontrado em users - Adicionando...');
        
        // Adicionar o usuário na tabela users
        const nameParts = simpleUser.name ? simpleUser.name.split(' ') : ['Rodrigo', 'Usuario'];
        const firstName = nameParts[0] || 'Rodrigo';
        const lastName = nameParts.slice(1).join(' ') || 'Usuario';
        
        await pool.query(`
          INSERT INTO users (
            id, uuid, email, first_name, last_name, 
            password_hash, password_salt, role, status, 
            email_verified, created_at
          )
          VALUES (
            $1, uuid_generate_v4(), $2, $3, $4,
            $5, 'defaultSalt', $6, 'active', 
            true, CURRENT_TIMESTAMP
          )
        `, [
          simpleUser.id, 
          simpleUser.email, 
          firstName, 
          lastName, 
          '$2b$10$defaultHashForMigration',
          simpleUser.role || 'admin'
        ]);
        
        console.log(`✅ Usuário adicionado em users: ID ${simpleUser.id}`);
      } else {
        console.log(`ℹ️  Já existe em users: ID ${rodyUsers.rows[0].id}`);
      }
      
    } else {
      console.log('❌ rodyrodrigo@gmail.com não encontrado em simple_users');
    }
    
    // Verificação final
    console.log('\n📊 VERIFICAÇÃO FINAL:');
    const finalSimple = await pool.query('SELECT id, role FROM simple_users WHERE email = $1', ['rodyrodrigo@gmail.com']);
    const finalUsers = await pool.query('SELECT id, role FROM users WHERE email = $1', ['rodyrodrigo@gmail.com']);
    
    if (finalSimple.rows.length > 0 && finalUsers.rows.length > 0) {
      const simple = finalSimple.rows[0];
      const user = finalUsers.rows[0];
      
      console.log(`   simple_users: ID ${simple.id} - ${simple.role}`);
      console.log(`   users: ID ${user.id} - ${user.role}`);
      
      if (simple.id === user.id && simple.role === user.role) {
        console.log('   ✅ PERFEITAMENTE SINCRONIZADO!');
      } else {
        console.log('   ❌ AINDA INCONSISTENTE');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

fixRody().catch(console.error);