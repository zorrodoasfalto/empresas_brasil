const axios = require('axios');

async function testVictorLogin() {
  try {
    console.log('🧪 TESTE COMPLETO DE LOGIN - Victor Admin');
    console.log('=' .repeat(50));
    
    const email = 'victormagalhaesg@gmail.com';
    const password = 'VictorAdmin2025!';
    
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    
    // 1. Teste de login
    console.log('\n🔐 1. Fazendo login...');
    const loginResponse = await axios.post('http://localhost:6000/api/auth/login', {
      email: email,
      password: password
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ Login realizado com sucesso!');
      
      const token = loginResponse.data.token;
      console.log('🎫 Token recebido:', token.substring(0, 50) + '...');
      
      // 2. Teste de créditos
      console.log('\n💳 2. Verificando créditos...');
      const creditsResponse = await axios.get('http://localhost:6000/api/credits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (creditsResponse.status === 200) {
        console.log('✅ API de créditos funcionando!');
        console.log('📊 Dados recebidos:', JSON.stringify(creditsResponse.data, null, 2));
        
        if (creditsResponse.data.credits === 10000) {
          console.log('\n🎉 TESTE COMPLETO APROVADO!');
          console.log('✅ Login funcionando');
          console.log('✅ API de créditos funcionando');
          console.log('✅ Victor tem 10.000 créditos');
          console.log('✅ Frontend receberá os dados corretos');
          
          console.log('\n📱 COMO TESTAR NO FRONTEND:');
          console.log('1. Acesse: http://localhost:4001');
          console.log('2. Faça login com:');
          console.log('   Email: victormagalhaesg@gmail.com');
          console.log('   Senha: VictorAdmin2025!');
          console.log('3. Verifique se aparece "10.000 créditos" no dashboard');
        } else {
          console.log('❌ ERRO: Créditos incorretos');
          console.log('Esperado: 10000');
          console.log('Recebido:', creditsResponse.data.credits);
        }
      } else {
        console.log('❌ Erro na API de créditos');
      }
      
    } else {
      console.log('❌ Erro no login');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  POSSÍVEIS CAUSAS:');
      console.log('- Senha incorreta');
      console.log('- Usuário não existe na tabela correta');
      console.log('- Problema com hash da senha');
    }
  }
}

testVictorLogin();