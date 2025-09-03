const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = 'empresas-brasil-jwt-secret-2025-super-secure-key-for-production-and-development';

async function testSimpleCredits() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🧪 TESTE SIMPLES DE CRÉDITOS - rodyrodrigo@gmail.com');
    console.log('=' .repeat(55));
    
    // 1. Verificar créditos atuais
    const creditsBefore = await pool.query(
      'SELECT credits FROM user_credits WHERE user_id = 2'
    );
    
    console.log(`💰 Créditos ANTES: ${creditsBefore.rows[0].credits}`);
    
    // 2. Gerar token
    const token = jwt.sign({ id: 2, email: 'rodyrodrigo@gmail.com' }, JWT_SECRET, { expiresIn: '1h' });
    console.log('🔑 Token gerado para teste via curl');
    console.log('📋 Execute este comando para testar:');
    console.log('');
    console.log(`curl -X POST http://localhost:6000/api/companies/filtered \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{"uf":"SP","companyLimit":1000,"page":1}' \\
  --connect-timeout 30`);
    console.log('');
    console.log('👆 Execute esse comando em outro terminal e depois me diga o resultado');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    pool.end();
  }
}

testSimpleCredits();