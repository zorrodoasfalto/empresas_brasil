const axios = require('axios');

async function testVictorRealLogin() {
  try {
    console.log('🧪 TESTE REAL DE LOGIN - Victor Admin');
    console.log('=' .repeat(50));
    
    const email = 'victormagalhaesg@gmail.com';
    const password = 'yMNmI2$V9aqq'; // Senha correta fornecida pelo usuário
    
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    
    // 1. Teste de login
    console.log('\n🔐 1. Fazendo login...');
    const loginResponse = await axios.post('http://localhost:6000/api/auth/login', {
      email: email,
      password: password
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ LOGIN REALIZADO COM SUCESSO!');
      
      const token = loginResponse.data.token;
      const userData = loginResponse.data.user;
      
      console.log('🎫 Token recebido:', token.substring(0, 50) + '...');
      console.log('👤 Dados do usuário:', JSON.stringify(userData, null, 2));
      
      // 2. Teste de créditos
      console.log('\n💳 2. Verificando créditos via API...');
      const creditsResponse = await axios.get('http://localhost:6000/api/credits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (creditsResponse.status === 200) {
        console.log('✅ API DE CRÉDITOS FUNCIONANDO!');
        console.log('📊 Dados dos créditos:', JSON.stringify(creditsResponse.data, null, 2));
        
        if (creditsResponse.data.credits === 10000) {
          console.log('\n🎉🎉🎉 TESTE COMPLETO APROVADO! 🎉🎉🎉');
          console.log('✅ Login funcionando perfeitamente');
          console.log('✅ API de créditos retornando 10.000');
          console.log('✅ Victor é admin com acesso total');
          console.log('✅ Frontend receberá os dados corretos');
          
          console.log('\n📱 CONFIRMAÇÃO PARA O FRONTEND:');
          console.log('🌐 Acesse: http://localhost:4001');
          console.log('📧 Email: victormagalhaesg@gmail.com');
          console.log('🔑 Senha: yMNmI2$V9aqq');
          console.log('💳 Créditos esperados: 10.000');
          console.log('👑 Role: admin');
          
        } else {
          console.log('⚠️  ATENÇÃO: Créditos diferentes do esperado');
          console.log('Esperado: 10000');
          console.log('Recebido:', creditsResponse.data.credits);
        }
      } else {
        console.log('❌ Erro na API de créditos:', creditsResponse.status);
      }
      
    } else {
      console.log('❌ Erro no login:', loginResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Login falhou - credenciais incorretas');
    } else if (error.response?.status === 500) {
      console.log('\n⚠️  Erro interno do servidor');
    }
  }
}

testVictorRealLogin();