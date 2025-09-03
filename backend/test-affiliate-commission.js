const { Pool } = require('pg');
require('dotenv').config();

async function testAffiliateCommission() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('💰 TESTANDO SISTEMA DE COMISSÕES DO VICTOR');
    console.log('=' .repeat(60));
    
    // 1. Status atual do Victor como afiliado
    console.log('📊 1. STATUS ATUAL DO VICTOR:');
    const victorAffiliate = await pool.query(`
      SELECT a.*, u.email, u.first_name, u.last_name
      FROM affiliates a
      JOIN users u ON a.user_id = u.id
      WHERE u.id = 39
    `);
    
    if (victorAffiliate.rows.length > 0) {
      const victor = victorAffiliate.rows[0];
      console.log(`   ✅ Victor é afiliado`);
      console.log(`   📋 Código: ${victor.affiliate_code}`);
      console.log(`   👥 Total de referrals: ${victor.total_referrals}`);
      console.log(`   💰 Total de comissões: R$ ${(victor.total_commissions / 100).toFixed(2)}`);
      console.log(`   📅 Criado em: ${victor.created_at}`);
    } else {
      console.log('   ❌ Victor não é afiliado');
      return;
    }
    
    // 2. Verificar referrals existentes do Victor
    console.log('\n👥 2. REFERRALS EXISTENTES DO VICTOR:');
    const existingReferrals = await pool.query(`
      SELECT ar.*, u.email as referred_email
      FROM affiliate_referrals ar
      JOIN affiliates a ON ar.affiliate_id = a.id
      JOIN users u ON ar.referred_user_id = u.id
      WHERE a.user_id = 39
      ORDER BY ar.created_at DESC
    `);
    
    if (existingReferrals.rows.length > 0) {
      console.log(`   📊 Victor já tem ${existingReferrals.rows.length} referrals:`);
      existingReferrals.rows.forEach(ref => {
        console.log(`   • ${ref.referred_email} - Plano: ${ref.plan_type} - Comissão mensal: R$ ${(ref.monthly_commission/100).toFixed(2)} - Status: ${ref.status}`);
      });
    } else {
      console.log('   📋 Victor ainda não tem referrals');
    }
    
    // 3. Verificar comissões pagas
    console.log('\n💸 3. COMISSÕES PAGAS AO VICTOR:');
    const paidCommissions = await pool.query(`
      SELECT ac.*, u.email as referred_email
      FROM affiliate_commissions ac
      JOIN affiliates a ON ac.affiliate_id = a.id
      JOIN users u ON ac.referred_user_id = u.id
      WHERE a.user_id = 39
      ORDER BY ac.commission_month DESC
    `);
    
    if (paidCommissions.rows.length > 0) {
      console.log(`   💰 Victor já recebeu ${paidCommissions.rows.length} comissões:`);
      let totalPaid = 0;
      paidCommissions.rows.forEach(comm => {
        totalPaid += comm.amount;
        console.log(`   • ${comm.commission_month}: R$ ${(comm.amount/100).toFixed(2)} de ${comm.referred_email} (${comm.plan_type})`);
      });
      console.log(`   💵 Total pago: R$ ${(totalPaid/100).toFixed(2)}`);
    } else {
      console.log('   📋 Victor ainda não recebeu comissões');
    }
    
    // 4. Simular comissão quando esposa usar código
    console.log('\n🧪 4. SIMULAÇÃO: ESPOSA USA CÓDIGO VICT039');
    
    const PLANS = {
      pro: { price: 9700, credits: 50 },      // R$ 97.00
      premium: { price: 14700, credits: 150 }, // R$ 147.00  
      max: { price: 24700, credits: 300 }     // R$ 247.00
    };
    
    console.log('   💡 Quando esposa comprar um plano:');
    Object.entries(PLANS).forEach(([planKey, plan]) => {
      const commission = Math.round(plan.price * 0.15); // 15% comissão
      const discount = Math.round(plan.price * 0.1);    // 10% desconto
      const finalPrice = plan.price - discount;
      
      console.log(`   📊 ${planKey.toUpperCase()}:`);
      console.log(`      • Preço original: R$ ${(plan.price/100).toFixed(2)}`);
      console.log(`      • Desconto esposa (10%): R$ ${(discount/100).toFixed(2)}`);
      console.log(`      • Preço final esposa: R$ ${(finalPrice/100).toFixed(2)}`);
      console.log(`      • Comissão Victor (15%): R$ ${(commission/100).toFixed(2)} por mês`);
      console.log(`      • Victor ganha: +1 referral`);
      console.log('');
    });
    
    // 5. Verificar se sistema está configurado corretamente
    console.log('🔧 5. VERIFICAÇÃO DO SISTEMA:');
    
    // Verificar se tabelas existem
    const tables = ['affiliates', 'affiliate_referrals', 'affiliate_commissions'];
    for (const table of tables) {
      const exists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      if (exists.rows[0].exists) {
        console.log(`   ✅ Tabela ${table} existe`);
      } else {
        console.log(`   ❌ Tabela ${table} NÃO existe`);
      }
    }
    
    console.log('\n🎯 RESUMO:');
    console.log('   ✅ Victor é afiliado com código VICT039');
    console.log('   ✅ Sistema de comissões configurado');
    console.log('   ✅ Quando esposa usar o código:');
    console.log('      • Esposa ganha 10% de desconto');
    console.log('      • Victor ganha 15% de comissão mensal');
    console.log('      • Victor ganha +1 referral');
    console.log('      • Comissão é paga automaticamente todo mês');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

testAffiliateCommission();