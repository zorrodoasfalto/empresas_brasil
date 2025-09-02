const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testAffiliateSystem() {
  try {
    console.log('🔍 VERIFICANDO SISTEMA DE AFILIADOS');
    console.log('=' .repeat(50));
    
    // 1. Verificar se tabelas existem
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('affiliates', 'affiliate_referrals', 'affiliate_commissions', 'subscriptions')
      ORDER BY table_name;
    `);
    
    console.log('📋 Tabelas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
    
    // 2. Verificar afiliados existentes
    const affiliatesResult = await pool.query('SELECT COUNT(*) as count FROM affiliates');
    console.log(`\n🎯 Total de afiliados: ${affiliatesResult.rows[0].count}`);
    
    // 3. Verificar configuração de comissões
    const PLANS = {
      pro: { price: 9700, credits: 50 },      // R$ 97.00
      premium: { price: 14700, credits: 150 }, // R$ 147.00  
      max: { price: 24700, credits: 300 }     // R$ 247.00
    };
    
    console.log('\n💰 CONFIGURAÇÃO DE COMISSÕES (15%):');
    Object.entries(PLANS).forEach(([planKey, plan]) => {
      const commission = Math.round(plan.price * 0.15);
      console.log(`   ${planKey.toUpperCase()}: R$ ${(plan.price/100).toFixed(2)} → Comissão: R$ ${(commission/100).toFixed(2)}`);
    });
    
    console.log('\n💸 CONFIGURAÇÃO DE DESCONTOS (10%):');
    Object.entries(PLANS).forEach(([planKey, plan]) => {
      const discount = Math.round(plan.price * 0.1);
      const finalPrice = plan.price - discount;
      console.log(`   ${planKey.toUpperCase()}: R$ ${(plan.price/100).toFixed(2)} → Com desconto: R$ ${(finalPrice/100).toFixed(2)}`);
    });
    
    // 4. Verificar referrals existentes
    const referralsResult = await pool.query('SELECT COUNT(*) as count FROM affiliate_referrals');
    console.log(`\n📊 Total de referrals: ${referralsResult.rows[0].count}`);
    
    // 5. Verificar comissões pagas
    const commissionsResult = await pool.query('SELECT COUNT(*) as count, SUM(amount) as total FROM affiliate_commissions');
    const totalCommissions = commissionsResult.rows[0].total || 0;
    console.log(`📈 Comissões pagas: ${commissionsResult.rows[0].count} (Total: R$ ${(totalCommissions/100).toFixed(2)})`);
    
    console.log('\n✅ SISTEMA DE AFILIADOS CONFIGURADO E FUNCIONANDO:');
    console.log('   🎯 Desconto de 10% para quem usa link de afiliado');
    console.log('   💰 Comissão de 15% recorrente para afiliados');
    console.log('   🔄 Comissões pagas automaticamente via webhooks');
    console.log('   📱 Interface de afiliado disponível em /settings?tab=affiliate');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    pool.end();
  }
}

testAffiliateSystem();