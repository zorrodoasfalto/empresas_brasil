const { Pool } = require('pg');
require('dotenv').config();

async function testDiscountScenarios() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🧪 TESTANDO CENÁRIOS DE DESCONTO');
    console.log('=' .repeat(50));
    
    // Simular função checkReferralTracking
    async function checkReferralTracking(referredUserId, affiliateCode) {
      if (!affiliateCode) {
        console.log('❌ No affiliate code provided');
        return null;
      }

      console.log(`🔍 Looking for affiliate code in DB: ${affiliateCode}`);
      const affiliateResult = await pool.query(
        'SELECT id, user_id FROM affiliates WHERE affiliate_code = $1',
        [affiliateCode]
      );

      if (affiliateResult.rows.length === 0) {
        console.log(`❌ Affiliate code not found in database: ${affiliateCode}`);
        return null;
      }

      const affiliate = affiliateResult.rows[0];
      console.log(`✅ Found affiliate: ${affiliate.id} belonging to user: ${affiliate.user_id}`);
      
      if (affiliate.user_id === referredUserId) {
        console.log('❌ User trying to refer themselves - blocked');
        return null;
      }

      console.log(`✅ Valid referral! Affiliate ID: ${affiliate.id}`);
      return affiliate.id;
    }
    
    // Testar diferentes cenários
    console.log('\n📋 CENÁRIO 1: Usuário diferente usando código do Victor');
    const scenario1 = await checkReferralTracking(1, 'VICT039'); // User ID 1
    console.log('Resultado:', scenario1 ? 'DESCONTO APLICADO' : 'SEM DESCONTO');
    
    console.log('\n📋 CENÁRIO 2: Victor (User ID 39) usando próprio código');
    const scenario2 = await checkReferralTracking(39, 'VICT039'); // Victor usando próprio código
    console.log('Resultado:', scenario2 ? 'DESCONTO APLICADO' : 'SEM DESCONTO');
    
    console.log('\n📋 CENÁRIO 3: Código inexistente');
    const scenario3 = await checkReferralTracking(1, 'INEXISTENTE');
    console.log('Resultado:', scenario3 ? 'DESCONTO APLICADO' : 'SEM DESCONTO');
    
    console.log('\n💰 CÁLCULO DE DESCONTO:');
    const PLANS = {
      pro: { price: 9700 },     // R$ 97.00
      premium: { price: 14700 }, // R$ 147.00
      max: { price: 24700 }     // R$ 247.00
    };
    
    Object.entries(PLANS).forEach(([planKey, plan]) => {
      const discountAmount = Math.round(plan.price * 0.1);
      const finalPrice = plan.price - discountAmount;
      console.log(`   ${planKey.toUpperCase()}: R$ ${(plan.price/100).toFixed(2)} → Desconto: R$ ${(discountAmount/100).toFixed(2)} → Final: R$ ${(finalPrice/100).toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

testDiscountScenarios();