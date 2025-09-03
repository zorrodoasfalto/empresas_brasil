const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = 'empresas-brasil-jwt-secret-2025-super-secure-key-for-production-and-development';

async function testCreditsDeduction() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🧪 TESTANDO DEDUÇÃO DE CRÉDITOS (rodyrodrigo@gmail.com)');
    console.log('=' .repeat(70));
    
    const adminEmail = 'rodyrodrigo@gmail.com';
    
    // 1. Buscar usuário admin no banco
    console.log('👤 1. BUSCANDO USUÁRIO ADMIN:');
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuário admin não encontrado!');
      return;
    }
    
    const admin = userResult.rows[0];
    console.log(`   ✅ Admin encontrado: ID ${admin.id}, Email: ${admin.email}`);
    
    // 2. Verificar créditos ANTES do teste
    console.log('\n💰 2. CRÉDITOS ANTES DO TESTE:');
    const creditsBefore = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = $1',
      [admin.id]
    );
    
    const initialCredits = creditsBefore.rows[0].credits;
    console.log(`   💳 Créditos atuais: ${initialCredits}`);
    
    // 3. Gerar token JWT válido para o usuário
    console.log('\n🔑 3. GERANDO TOKEN JWT:');
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log(`   ✅ Token gerado com sucesso`);
    
    // 4. Fazer uma busca simulando exatamente o que o frontend faz
    console.log('\n🔍 4. SIMULANDO BUSCA DE EMPRESAS:');
    console.log('   📤 Fazendo POST para /api/companies/filtered...');
    
    const searchResponse = await fetch('http://localhost:6000/api/companies/filtered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        uf: 'SP',
        companyLimit: 1000,
        page: 1
      })
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`   ✅ Busca realizada: ${searchData.companies?.length || 0} empresas encontradas`);
    } else {
      const errorData = await searchResponse.text();
      console.log(`   ❌ Erro na busca: ${searchResponse.status} - ${errorData}`);
    }
    
    // 5. Verificar créditos DEPOIS do teste
    console.log('\n💰 5. CRÉDITOS DEPOIS DO TESTE:');
    const creditsAfter = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = $1',
      [admin.id]
    );
    
    const finalCredits = creditsAfter.rows[0].credits;
    const creditsDifference = initialCredits - finalCredits;
    
    console.log(`   💳 Créditos finais: ${finalCredits}`);
    console.log(`   🔻 Diferença: ${creditsDifference} créditos`);
    
    // 6. Analisar resultado
    console.log('\n📊 6. ANÁLISE DO RESULTADO:');
    if (creditsDifference === 1) {
      console.log('   ✅ CORRETO: Debitou exatamente 1 crédito');
    } else if (creditsDifference === 2) {
      console.log('   ❌ PROBLEMA CONFIRMADO: Debitou 2 créditos em vez de 1');
    } else if (creditsDifference > 2) {
      console.log(`   ❌ PROBLEMA GRAVE: Debitou ${creditsDifference} créditos!`);
    } else if (creditsDifference === 0) {
      console.log('   ⚠️  ESTRANHO: Nenhum crédito foi debitado');
    }
    
    // 7. Verificar log de uso de créditos
    console.log('\n📋 7. LOG DE USO DE CRÉDITOS (últimos 3):');
    const usageLog = await pool.query(
      `SELECT user_id, search_type, credits_used, timestamp 
       FROM credit_usage_log 
       WHERE user_id = $1 
       ORDER BY timestamp DESC 
       LIMIT 3`,
      [admin.id]
    );
    
    if (usageLog.rows.length > 0) {
      usageLog.rows.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.search_type}: ${log.credits_used} créditos em ${log.timestamp.toLocaleString('pt-BR')}`);
      });
    } else {
      console.log('   📋 Nenhum log de uso encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    pool.end();
  }
}

testCreditsDeduction();