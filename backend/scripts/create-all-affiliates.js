const { Pool } = require('pg');

async function createAllAffiliates() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚀 TRANSFORMANDO TODOS USUÁRIOS EM AFILIADOS');
    console.log('='.repeat(50));
    
    // 1. Buscar todos os usuários da tabela simple_users que não são afiliados ainda
    const usersQuery = await pool.query(`
      SELECT su.id, su.email, su.name 
      FROM simple_users su
      LEFT JOIN affiliates a ON su.id = a.user_id
      WHERE a.id IS NULL
      ORDER BY su.id
    `);
    
    const users = usersQuery.rows;
    console.log(`📊 Encontrados ${users.length} usuários para transformar em afiliados`);
    
    if (users.length === 0) {
      console.log('✅ Todos os usuários já são afiliados!');
      return;
    }
    
    // 2. Criar código de afiliado único para cada usuário
    let createdCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        // Gerar código único baseado no ID + primeiras letras do email
        const emailPrefix = user.email.split('@')[0].substring(0, 4).toUpperCase();
        const affiliateCode = `${emailPrefix}${user.id.toString().padStart(3, '0')}`;
        
        // Criar afiliado com algumas comissões de teste (R$ 150,00 = 15000 centavos)
        const testCommissions = Math.floor(Math.random() * 20000) + 5000; // Entre R$ 50 e R$ 250
        
        await pool.query(`
          INSERT INTO affiliates (user_id, affiliate_code, total_referrals, total_commissions)
          VALUES ($1, $2, $3, $4)
        `, [user.id, affiliateCode, Math.floor(Math.random() * 5), testCommissions]);
        
        console.log(`✅ ${user.name} (${user.email}) → Afiliado ${affiliateCode} | R$ ${(testCommissions/100).toFixed(2)}`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ Erro ao criar afiliado para ${user.email}:`, error.message);
        errorCount++;
      }
    }
    
    // 3. Mostrar estatísticas finais
    console.log('\n📈 RESULTADO FINAL:');
    console.log(`   ✅ Afiliados criados: ${createdCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    
    // 4. Verificar total de afiliados
    const totalAffiliates = await pool.query('SELECT COUNT(*) as count FROM affiliates');
    console.log(`   📊 Total de afiliados no sistema: ${totalAffiliates.rows[0].count}`);
    
    // 5. Mostrar alguns exemplos
    const sampleAffiliates = await pool.query(`
      SELECT 
        a.affiliate_code,
        a.total_commissions,
        su.name,
        su.email
      FROM affiliates a
      INNER JOIN simple_users su ON a.user_id = su.id
      ORDER BY a.total_commissions DESC
      LIMIT 5
    `);
    
    console.log('\n💰 TOP 5 AFILIADOS COM MAIORES COMISSÕES:');
    sampleAffiliates.rows.forEach((affiliate, index) => {
      console.log(`   ${index + 1}. ${affiliate.name} (${affiliate.affiliate_code}) - R$ ${(affiliate.total_commissions/100).toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createAllAffiliates();
}

module.exports = { createAllAffiliates };