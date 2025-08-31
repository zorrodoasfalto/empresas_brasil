const { Pool } = require('pg');

async function checkAdmins() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 VERIFICANDO ADMINISTRADORES NO SISTEMA');
    console.log('='.repeat(40));
    
    // Verificar admins em simple_users
    const adminsSimple = await pool.query(`
      SELECT id, email, name, role 
      FROM simple_users 
      WHERE role = 'admin'
      ORDER BY id
    `);
    
    console.log(`👑 ADMINS em simple_users: ${adminsSimple.rows.length}`);
    adminsSimple.rows.forEach(admin => {
      console.log(`   - ID ${admin.id}: ${admin.email} (${admin.name})`);
    });
    
    // Verificar admins em users
    const adminsUsers = await pool.query(`
      SELECT id, email, first_name, last_name, role 
      FROM users 
      WHERE role = 'admin'
      ORDER BY id
    `);
    
    console.log(`\n👑 ADMINS em users: ${adminsUsers.rows.length}`);
    adminsUsers.rows.forEach(admin => {
      console.log(`   - ID ${admin.id}: ${admin.email} (${admin.first_name} ${admin.last_name})`);
    });
    
    // Verificar se são os mesmos
    console.log('\n✅ VERIFICAÇÃO DE CONSISTÊNCIA:');
    if (adminsSimple.rows.length === adminsUsers.rows.length && adminsSimple.rows.length === 1) {
      const simpleAdmin = adminsSimple.rows[0];
      const usersAdmin = adminsUsers.rows[0];
      
      if (simpleAdmin.email === usersAdmin.email && simpleAdmin.id === usersAdmin.id) {
        console.log(`   ✅ APENAS 1 ADMIN: ${simpleAdmin.email} (ID ${simpleAdmin.id})`);
      } else {
        console.log('   ❌ INCONSISTÊNCIA entre as tabelas');
      }
    } else {
      console.log(`   ⚠️  MÚLTIPLOS ADMINS ou INCONSISTÊNCIA`);
      console.log(`   simple_users: ${adminsSimple.rows.length} | users: ${adminsUsers.rows.length}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkAdmins();