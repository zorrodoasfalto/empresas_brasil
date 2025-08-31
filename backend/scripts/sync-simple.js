const { Pool } = require('pg');

async function syncSimple() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔧 SINCRONIZAÇÃO SIMPLES - ELIMINANDO INCONSISTÊNCIAS');
    console.log('='.repeat(50));
    
    // 1. Verificar estado inicial
    const simpleCount = await pool.query('SELECT COUNT(*) as count FROM simple_users');
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    console.log(`📊 ESTADO INICIAL:`);
    console.log(`   simple_users: ${simpleCount.rows[0].count} usuários`);
    console.log(`   users: ${usersCount.rows[0].count} usuários`);
    
    // 2. Verificar estrutura da simple_users
    const simpleColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'simple_users'
      ORDER BY ordinal_position
    `);
    
    console.log(`\n📋 Campos em simple_users:`);
    simpleColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // 3. Adicionar campo role se não existir
    const hasRole = simpleColumns.rows.some(col => col.column_name === 'role');
    if (!hasRole) {
      await pool.query(`ALTER TABLE simple_users ADD COLUMN role VARCHAR(20) DEFAULT 'user'`);
      console.log('✅ Campo role adicionado');
    } else {
      console.log('ℹ️  Campo role já existe');
    }
    
    // 4. Encontrar usuários apenas em users
    const onlyInUsers = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role
      FROM users u
      LEFT JOIN simple_users s ON u.email = s.email
      WHERE s.email IS NULL
      ORDER BY u.id
    `);
    
    console.log(`\n🔍 USUÁRIOS APENAS EM USERS: ${onlyInUsers.rows.length}`);
    onlyInUsers.rows.forEach(user => {
      console.log(`   - ID ${user.id}: ${user.email} (${user.first_name} ${user.last_name}) - ${user.role || 'user'}`);
    });
    
    // 5. Adicionar usuários faltantes em simple_users
    console.log(`\n🔄 ADICIONANDO USUÁRIOS FALTANTES EM simple_users:`);
    for (const user of onlyInUsers.rows) {
      const password = '$2b$10$defaultHashForMigration';
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      
      await pool.query(`
        INSERT INTO simple_users (id, email, name, password, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          email = $2, name = $3, role = $5
      `, [user.id, user.email, fullName, password, user.role || 'user']);
      
      console.log(`   ✅ Adicionado: ID ${user.id} - ${user.email}`);
    }
    
    // 6. Encontrar usuários apenas em simple_users
    const onlyInSimple = await pool.query(`
      SELECT s.id, s.email, s.name, s.role
      FROM simple_users s
      LEFT JOIN users u ON s.email = u.email
      WHERE u.email IS NULL
      ORDER BY s.id
    `);
    
    console.log(`\n🔍 USUÁRIOS APENAS EM simple_users: ${onlyInSimple.rows.length}`);
    onlyInSimple.rows.forEach(user => {
      console.log(`   - ID ${user.id}: ${user.email} (${user.name}) - ${user.role || 'user'}`);
    });
    
    // 7. Adicionar usuários faltantes em users
    console.log(`\n🔄 ADICIONANDO USUÁRIOS FALTANTES EM users:`);
    for (const user of onlyInSimple.rows) {
      const nameParts = user.name ? user.name.split(' ') : ['User', 'Unknown'];
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';
      const defaultHash = '$2b$10$defaultHashForMigration';
      
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
        ON CONFLICT (id) DO UPDATE SET
          email = $2, first_name = $3, last_name = $4,
          role = $6, status = 'active'
      `, [user.id, user.email, firstName, lastName, defaultHash, user.role || 'user']);
      
      console.log(`   ✅ Adicionado: ID ${user.id} - ${user.email}`);
    }
    
    // 8. Verificação final
    const finalSimple = await pool.query('SELECT COUNT(*) as count FROM simple_users');
    const finalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    
    console.log(`\n📊 ESTADO FINAL:`);
    console.log(`   simple_users: ${finalSimple.rows[0].count} usuários`);
    console.log(`   users: ${finalUsers.rows[0].count} usuários`);
    
    // 9. Verificar rodyrodrigo especificamente
    const rodySimple = await pool.query('SELECT id, role FROM simple_users WHERE email = $1', ['rodyrodrigo@gmail.com']);
    const rodyUsers = await pool.query('SELECT id, role FROM users WHERE email = $1', ['rodyrodrigo@gmail.com']);
    
    console.log(`\n🎯 VERIFICAÇÃO rodyrodrigo@gmail.com:`);
    if (rodySimple.rows.length > 0) {
      console.log(`   simple_users: ID ${rodySimple.rows[0].id} - ${rodySimple.rows[0].role}`);
    }
    if (rodyUsers.rows.length > 0) {
      console.log(`   users: ID ${rodyUsers.rows[0].id} - ${rodyUsers.rows[0].role}`);
    }
    
    if (rodySimple.rows.length > 0 && rodyUsers.rows.length > 0) {
      if (rodySimple.rows[0].id === rodyUsers.rows[0].id) {
        console.log(`   ✅ IDs CONSISTENTES!`);
      } else {
        console.log(`   ❌ IDs DIFERENTES - AINDA INCONSISTENTE`);
      }
    }
    
    console.log('\n🎉 SINCRONIZAÇÃO CONCLUÍDA!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

syncSimple().catch(console.error);