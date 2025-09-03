const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false }
});

async function checkRody() {
  try {
    console.log('🔍 Verificando usuário rodyrodrigo@gmail.com...');
    
    // Check in simple_users table
    const simpleUser = await pool.query('SELECT * FROM simple_users WHERE email = $1', ['rodyrodrigo@gmail.com']);
    console.log('\n📋 simple_users table:');
    if (simpleUser.rows.length > 0) {
      const user = simpleUser.rows[0];
      console.log('✅ Encontrado!');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- Created:', user.created_at);
      
      // Now check credits in user_credits table
      const creditsResult = await pool.query('SELECT * FROM user_credits WHERE user_id = $1', [user.id]);
      console.log('\n💳 user_credits table:');
      if (creditsResult.rows.length > 0) {
        const credits = creditsResult.rows[0];
        console.log('✅ Créditos encontrados!');
        console.log('- Créditos:', credits.credits);
        console.log('- Plano:', credits.plan);
        console.log('- Created:', credits.created_at);
        console.log('- Updated:', credits.updated_at);
      } else {
        console.log('❌ PROBLEMA: Nenhum registro de créditos encontrado!');
        console.log('🚨 Admin deveria ter 10.000 créditos automaticamente');
      }
    } else {
      console.log('❌ Não encontrado em simple_users');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Erro:', error);
    await pool.end();
    process.exit(1);
  }
}

checkRody();