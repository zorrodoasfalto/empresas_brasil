const { Pool } = require('pg');
require('dotenv').config();

async function testAdminCredits() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 TESTANDO CRÉDITOS DO ADMIN (rodyrodrigo@gmail.com)');
    console.log('=' .repeat(60));
    
    const adminEmail = 'rodyrodrigo@gmail.com';
    
    // 1. Buscar usuário admin
    console.log('👤 1. BUSCANDO USUÁRIO ADMIN:');
    const userResult = await pool.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuário admin não encontrado!');
      return;
    }
    
    const admin = userResult.rows[0];
    console.log(`   ✅ Admin encontrado: ${admin.first_name} ${admin.last_name}`);
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   👑 Role: ${admin.role}`);
    console.log(`   🆔 ID: ${admin.id}`);
    
    // 2. Verificar créditos na tabela user_credits
    console.log('\n💰 2. CRÉDITOS NA TABELA user_credits:');
    const creditsResult = await pool.query(
      'SELECT * FROM user_credits WHERE user_id = $1',
      [admin.id]
    );
    
    if (creditsResult.rows.length > 0) {
      const credits = creditsResult.rows[0];
      console.log(`   ✅ Créditos encontrados: ${credits.credits}`);
      console.log(`   📋 Plano: ${credits.plan}`);
      console.log(`   📅 Criado em: ${credits.created_at}`);
      console.log(`   📅 Atualizado em: ${credits.updated_at}`);
    } else {
      console.log('   ❌ Créditos NÃO encontrados na tabela user_credits');
    }
    
    // 3. Verificar créditos na tabela simple_users (se existir)
    console.log('\n💳 3. CRÉDITOS NA TABELA simple_users:');
    try {
      const simpleUserResult = await pool.query(
        'SELECT credits FROM simple_users WHERE email = $1',
        [adminEmail]
      );
      
      if (simpleUserResult.rows.length > 0) {
        const simpleUser = simpleUserResult.rows[0];
        console.log(`   ✅ Créditos em simple_users: ${simpleUser.credits}`);
      } else {
        console.log('   ❌ Usuário NÃO encontrado na tabela simple_users');
      }
    } catch (error) {
      console.log('   ⚠️  Tabela simple_users pode não existir:', error.message);
    }
    
    // 4. Verificar se admin tem 10.000 créditos como deveria
    console.log('\n🎯 4. VERIFICAÇÃO FINAL:');
    if (creditsResult.rows.length > 0) {
      const currentCredits = creditsResult.rows[0].credits;
      if (currentCredits === 10000) {
        console.log('   ✅ PERFEITO! Admin tem exatamente 10.000 créditos');
      } else if (currentCredits > 9000) {
        console.log(`   ⚠️  Admin tem ${currentCredits} créditos (quase 10k, pode ter usado alguns)`);
      } else {
        console.log(`   ❌ PROBLEMA! Admin tem apenas ${currentCredits} créditos (deveria ter 10.000)`);
      }
    }
    
    console.log('\n📊 RESUMO:');
    console.log(`   👤 Usuário: ${admin.email} (ID: ${admin.id})`);
    console.log(`   👑 Role: ${admin.role}`);
    console.log(`   💰 Créditos: ${creditsResult.rows.length > 0 ? creditsResult.rows[0].credits : 'NÃO ENCONTRADO'}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

testAdminCredits();