const axios = require('axios');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/jwt');

async function testVictorCreditsAPI() {
  try {
    console.log('🧪 TESTANDO API DE CRÉDITOS PARA victormagalhaesg@gmail.com');
    console.log('=' .repeat(60));
    
    // Gerar token para Victor (simulando login)
    const payload = {
      id: 39, // ID do Victor no banco
      email: 'victormagalhaesg@gmail.com'
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    console.log('✅ Token gerado para Victor');
    
    // Testar endpoint de créditos
    console.log('\n🔍 Testando GET /api/credits...');
    
    const response = await axios.get('http://localhost:6000/api/credits', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Resposta da API:');
    console.log('- Status:', response.status);
    console.log('- Dados:', JSON.stringify(response.data, null, 2));
    
    if (response.data.credits === 10000) {
      console.log('\n✅ SUCESSO! API retornando 10.000 créditos corretamente');
    } else {
      console.log('\n❌ ERRO! API não está retornando 10.000 créditos');
      console.log('Créditos retornados:', response.data.credits);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  NOTA: Backend não está rodando. Execute:');
      console.log('   node claude-startup.js');
    }
  }
}

testVictorCreditsAPI();