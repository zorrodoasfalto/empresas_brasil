const { Pool } = require('pg');
require('dotenv').config();

async function testAffiliateCode() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Testando código de afiliado VICT039...');
    
    // Verificar se o código existe
    const affiliateResult = await pool.query(
      'SELECT id, user_id, affiliate_code, total_referrals FROM affiliates WHERE affiliate_code = $1',
      ['VICT039']
    );
    
    if (affiliateResult.rows.length === 0) {
      console.log('❌ Código VICT039 não encontrado!');
      
      // Mostrar todos os códigos disponíveis
      const allCodes = await pool.query('SELECT affiliate_code, user_id FROM affiliates ORDER BY id');
      console.log('\n📋 Códigos de afiliado disponíveis:');
      allCodes.rows.forEach(affiliate => {
        console.log(`   ${affiliate.affiliate_code} (User ID: ${affiliate.user_id})`);
      });
    } else {
      const affiliate = affiliateResult.rows[0];
      console.log('✅ Código encontrado:');
      console.log('   Código:', affiliate.affiliate_code);
      console.log('   Afiliado User ID:', affiliate.user_id);
      console.log('   Total referrals:', affiliate.total_referrals);
      
      // Buscar informações do usuário afiliado
      const userResult = await pool.query(
        'SELECT email, first_name, last_name FROM users WHERE id = $1',
        [affiliate.user_id]
      );
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        console.log('   Afiliado:', user.first_name, user.last_name);
        console.log('   Email:', user.email);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

testAffiliateCode();