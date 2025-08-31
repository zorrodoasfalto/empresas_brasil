const { Pool } = require('pg');

async function finalCheck() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('📊 VERIFICAÇÃO FINAL DE CONSISTÊNCIA');
    console.log('='.repeat(40));
    
    // Contagens
    const simpleCount = await pool.query('SELECT COUNT(*) as count FROM simple_users');
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    console.log(`✅ simple_users: ${simpleCount.rows[0].count} usuários`);
    console.log(`✅ users: ${usersCount.rows[0].count} usuários`);
    
    // Verificar inconsistências
    const onlyInSimple = await pool.query(`
      SELECT COUNT(*) as count 
      FROM simple_users s 
      LEFT JOIN users u ON s.email = u.email 
      WHERE u.email IS NULL
    `);
    
    const onlyInUsers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users u 
      LEFT JOIN simple_users s ON u.email = s.email 
      WHERE s.email IS NULL
    `);
    
    console.log(`\n🔍 ANÁLISE DE INCONSISTÊNCIAS:`);
    console.log(`   Apenas em simple_users: ${onlyInSimple.rows[0].count}`);
    console.log(`   Apenas em users: ${onlyInUsers.rows[0].count}`);
    
    // Verificar específicamente rodyrodrigo
    const rodySimple = await pool.query('SELECT id, role FROM simple_users WHERE email = $1', ['rodyrodrigo@gmail.com']);
    const rodyUsers = await pool.query('SELECT id, role FROM users WHERE email = $1', ['rodyrodrigo@gmail.com']);
    
    console.log(`\n🎯 VERIFICAÇÃO rodyrodrigo@gmail.com:`);
    if (rodySimple.rows.length > 0 && rodyUsers.rows.length > 0) {
      console.log(`   simple_users: ID ${rodySimple.rows[0].id} - ${rodySimple.rows[0].role}`);
      console.log(`   users: ID ${rodyUsers.rows[0].id} - ${rodyUsers.rows[0].role}`);
      
      if (rodySimple.rows[0].id === rodyUsers.rows[0].id) {
        console.log(`   ✅ CONSISTENTE!`);
      }
    }
    
    // Resultado final
    const totalInconsistencies = parseInt(onlyInSimple.rows[0].count) + parseInt(onlyInUsers.rows[0].count);
    console.log(`\n🏁 RESULTADO FINAL:`);
    if (totalInconsistencies === 0) {
      console.log(`   ✅ ZERO INCONSISTÊNCIAS! Bases sincronizadas 100%`);
    } else {
      console.log(`   ❌ ${totalInconsistencies} inconsistências restantes`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

finalCheck().catch(console.error);