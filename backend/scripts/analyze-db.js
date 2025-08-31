const { Pool } = require('pg');

async function analyzeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 ANALISANDO BASE DE DADOS - INCONSISTÊNCIAS');
    console.log('='.repeat(50));
    
    // 1. Total de usuários
    const totalUsers = await pool.query('SELECT COUNT(*) as total FROM users');
    console.log(`👥 Total de usuários: ${totalUsers.rows[0].total}`);
    
    // 2. Emails duplicados
    const duplicatedEmails = await pool.query(`
      SELECT email, COUNT(*) as count 
      FROM users 
      GROUP BY email 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicatedEmails.rows.length > 0) {
      console.log('\n❌ EMAILS DUPLICADOS:');
      duplicatedEmails.rows.forEach(row => {
        console.log(`  - ${row.email}: ${row.count} vezes`);
      });
    } else {
      console.log('\n✅ Nenhum email duplicado encontrado');
    }
    
    // 3. Usuários com problemas de status/role
    const problemUsers = await pool.query(`
      SELECT id, email, role, status, email_verified 
      FROM users 
      WHERE role IS NULL 
         OR status IS NULL 
         OR (role = 'admin' AND status != 'active')
      ORDER BY id
    `);
    
    if (problemUsers.rows.length > 0) {
      console.log('\n⚠️  USUÁRIOS COM PROBLEMAS:');
      problemUsers.rows.forEach(user => {
        console.log(`  - ID ${user.id}: ${user.email} - Role: ${user.role} - Status: ${user.status} - Verified: ${user.email_verified}`);
      });
    } else {
      console.log('\n✅ Nenhum usuário com problemas de status/role');
    }
    
    // 4. IDs gaps (sequência quebrada)
    const idGaps = await pool.query(`
      SELECT id, 
             LAG(id) OVER (ORDER BY id) as prev_id,
             id - LAG(id) OVER (ORDER BY id) - 1 as gap_size
      FROM users 
      ORDER BY id
    `);
    
    const gaps = idGaps.rows.filter(row => row.gap_size > 0);
    if (gaps.length > 0) {
      console.log('\n📊 GAPS na sequência de IDs:');
      gaps.forEach(gap => {
        console.log(`  - Gap entre ID ${gap.prev_id} e ${gap.id} (${gap.gap_size} IDs perdidos)`);
      });
    } else {
      console.log('\n✅ Sequência de IDs contínua');
    }
    
    // 5. Verificar específico do rodyrodrigo
    console.log('\n🔍 ANÁLISE ESPECÍFICA - rodyrodrigo@gmail.com:');
    const rodyUsers = await pool.query(`
      SELECT id, uuid, email, first_name, last_name, role, status, email_verified, created_at
      FROM users 
      WHERE email = 'rodyrodrigo@gmail.com'
      ORDER BY id
    `);
    
    if (rodyUsers.rows.length > 0) {
      rodyUsers.rows.forEach((user, index) => {
        console.log(`  ${index + 1}. ID ${user.id}: ${user.role} - ${user.status} - Criado: ${user.created_at?.toISOString()?.split('T')[0]}`);
      });
    } else {
      console.log('  ❌ Usuário não encontrado');
    }
    
    // 6. Verificar se ID 2 existe
    const id2Check = await pool.query('SELECT * FROM users WHERE id = 2');
    console.log(`\n🎯 Usuário ID 2: ${id2Check.rows.length > 0 ? 'EXISTS' : 'NOT FOUND'}`);
    if (id2Check.rows.length > 0) {
      const user2 = id2Check.rows[0];
      console.log(`   Email: ${user2.email} - Role: ${user2.role} - Status: ${user2.status}`);
    }
    
    // 7. Sugestão de correção
    console.log('\n💡 SUGESTÃO DE CORREÇÃO:');
    if (rodyUsers.rows.length > 0 && id2Check.rows.length === 0) {
      console.log('   1. JWT espera ID 2, mas usuário real é ID 8');
      console.log('   2. SOLUÇÃO: Alterar dados do usuário ID 8 para aparecer como ID 2 no JWT');
      console.log('   3. OU: Corrigir backend para usar ID correto');
    }

  } catch (error) {
    console.error('❌ Erro na análise:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

analyzeDatabase().catch(console.error);