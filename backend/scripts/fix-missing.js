const { Pool } = require('pg');

async function fixMissing() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔧 CORRIGINDO USUÁRIOS FALTANTES');
    console.log('='.repeat(35));
    
    // Encontrar usuários que estão apenas na tabela users
    const missing = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role
      FROM users u 
      LEFT JOIN simple_users s ON u.email = s.email 
      WHERE s.email IS NULL
      ORDER BY u.id
    `);
    
    console.log(`📋 USUÁRIOS FALTANTES EM simple_users: ${missing.rows.length}`);
    
    for (const user of missing.rows) {
      console.log(`\n🔧 Corrigindo ID ${user.id}: ${user.email}`);
      console.log(`   Nome: ${user.first_name || ''} ${user.last_name || ''}`);
      
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuario';
      const defaultPassword = '$2b$10$defaultHashForMigration';
      
      // Inserir na simple_users
      try {
        await pool.query(`
          INSERT INTO simple_users (id, email, name, password, role, subscription_active)
          VALUES ($1, $2, $3, $4, $5, false)
        `, [user.id, user.email, fullName, defaultPassword, user.role || 'user']);
        
        console.log(`   ✅ Adicionado com sucesso!`);
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`   ❌ ID ${user.id} já existe - tentando UPDATE`);
          await pool.query(`
            UPDATE simple_users 
            SET email = $2, name = $3, role = $4
            WHERE id = $1
          `, [user.id, user.email, fullName, user.role || 'user']);
          console.log(`   ✅ Atualizado com sucesso!`);
        } else {
          console.log(`   ❌ Erro: ${error.message}`);
        }
      }
    }
    
    // Verificação final
    console.log('\n📊 VERIFICAÇÃO FINAL:');
    const finalCheck = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM simple_users) as simple_count,
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM users u LEFT JOIN simple_users s ON u.email = s.email WHERE s.email IS NULL) as missing_count
    `);
    
    const result = finalCheck.rows[0];
    console.log(`   simple_users: ${result.simple_count}`);
    console.log(`   users: ${result.users_count}`);
    console.log(`   Faltantes: ${result.missing_count}`);
    
    if (result.missing_count == 0) {
      console.log('\n🎉 TODAS AS INCONSISTÊNCIAS ELIMINADAS!');
      console.log('✅ Bases 100% sincronizadas');
    } else {
      console.log(`\n❌ Ainda há ${result.missing_count} inconsistências`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

fixMissing().catch(console.error);