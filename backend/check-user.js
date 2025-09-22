const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false },
});

const JWT_SECRET = process.env.JWT_SECRET || 'empresas-brasil-jwt-secret-2025-super-secure-key-for-production-and-development';

async function checkUser() {
  try {
    console.log('🔍 Verificando usuário ID 2...');

    // Verificar se usuário existe na tabela correta (simple_users)
    const userResult = await pool.query('SELECT * FROM simple_users WHERE id = $1', [2]);

    if (userResult.rows.length === 0) {
      console.log('❌ Usuário ID 2 não encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      trial_expires: user.trial_expires,
      subscription_status: user.subscription_status
    });

    // Gerar token válido
    const token = jwt.sign({
      id: user.id,
      email: user.email
    }, JWT_SECRET, { expiresIn: '1h' });

    console.log('\n🔑 Token válido gerado:');
    console.log(token);

    console.log('\n📋 Comando de teste:');
    console.log(`curl -X POST http://localhost:6000/api/companies/filtered \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{"uf":"SP","segmentoNegocio":6,"situacaoCadastral":"02","companyLimit":1000}' \\
  -w "\\nTempo: %{time_total}s\\n"`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkUser();