const { Pool } = require('pg');

async function createRealWithdrawals() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('💰 CRIANDO SAQUES REAIS DE USUÁRIOS REAIS');
    console.log('='.repeat(50));
    
    // Limpar saques antigos primeiro
    await pool.query('DELETE FROM affiliate_withdrawals');
    console.log('🗑️ Saques antigos removidos');
    
    // Buscar afiliados reais
    const affiliatesQuery = await pool.query(`
      SELECT a.id, a.user_id, a.affiliate_code, a.total_commissions, su.name, su.email
      FROM affiliates a
      INNER JOIN simple_users su ON a.user_id = su.id
      ORDER BY a.id
      LIMIT 5
    `);
    
    const affiliates = affiliatesQuery.rows;
    console.log(`👥 Encontrados ${affiliates.length} afiliados reais`);
    
    if (affiliates.length === 0) {
      console.log('❌ Nenhum afiliado encontrado!');
      return;
    }
    
    // Criar saques para os primeiros 3 afiliados
    const withdrawalsToCreate = [
      {
        affiliate_id: affiliates[0].id,
        amount: 15000, // R$ 150.00
        pix_key: affiliates[0].email,
        status: 'pending'
      },
      {
        affiliate_id: affiliates[1].id,
        amount: 25000, // R$ 250.00
        pix_key: `cpf:${Math.random().toString().slice(2, 13)}`,
        status: 'pending'
      },
      {
        affiliate_id: affiliates[2] ? affiliates[2].id : affiliates[0].id,
        amount: 18000, // R$ 180.00
        pix_key: `telefone:+5511${Math.floor(Math.random() * 900000000 + 100000000)}`,
        status: 'approved',
        admin_notes: 'Saque aprovado automaticamente para teste'
      }
    ];
    
    let createdCount = 0;
    
    for (const withdrawal of withdrawalsToCreate) {
      await pool.query(`
        INSERT INTO affiliate_withdrawals (affiliate_id, amount, pix_key, status, admin_notes, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        withdrawal.affiliate_id,
        withdrawal.amount,
        withdrawal.pix_key,
        withdrawal.status,
        withdrawal.admin_notes || null
      ]);
      
      const affiliate = affiliates.find(a => a.id === withdrawal.affiliate_id);
      console.log(`✅ Saque criado para ${affiliate.name} (${affiliate.email})`);
      console.log(`   Valor: R$ ${(withdrawal.amount / 100).toFixed(2)}`);
      console.log(`   PIX: ${withdrawal.pix_key}`);
      console.log(`   Status: ${withdrawal.status}`);
      console.log('   ---');
      
      createdCount++;
    }
    
    console.log(`\n🎯 RESULTADO FINAL:`);
    console.log(`   ✅ Saques criados: ${createdCount}`);
    console.log(`   💰 Com usuários REAIS da base de dados`);
    console.log(`   🔄 Sistema pode ser testado agora!`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createRealWithdrawals();
}

module.exports = { createRealWithdrawals };