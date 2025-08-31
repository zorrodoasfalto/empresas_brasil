// Teste do frontend simulando navegador
const fetch = require('node-fetch');

async function testFrontend() {
  console.log('🧪 TESTANDO FRONTEND EXATAMENTE COMO NAVEGADOR');
  console.log('='.repeat(60));
  
  try {
    // 1. Login para obter token
    console.log('🔐 1. Fazendo login...');
    const loginResponse = await fetch('http://localhost:6000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rodyrodrigo@gmail.com',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login failed');
    }
    
    console.log('   ✅ Login OK, token obtido');
    const token = loginData.token;
    
    // 2. Simular exatamente o que o frontend faz
    console.log('\n🔍 2. Simulando loadAdminWithdrawals...');
    console.log('   setAdminWithdrawalsLoading(true) → Loading ON');
    
    // Fetch exatamente como o frontend
    console.log('   Fazendo fetch para /api/admin/withdrawals...');
    const response = await fetch('http://localhost:4001/api/admin/withdrawals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('   Response status:', response.status);
    
    const data = await response.json();
    console.log('   Data recebido:', JSON.stringify(data, null, 2));
    
    // Simular o que o frontend faria
    console.log('\n🔄 3. Simulando setAdminWithdrawals...');
    const withdrawals = data.withdrawals || [];
    console.log('   setAdminWithdrawals chamado com:', withdrawals.length, 'items');
    
    if (withdrawals.length > 0) {
      console.log('\n✅ DADOS QUE APARECERIAM NO FRONTEND:');
      withdrawals.forEach((w, i) => {
        console.log(`   ${i + 1}. ${w.affiliateName} - R$ ${(w.amount / 100).toFixed(2)} - ${w.status}`);
        console.log(`      PIX: ${w.pixKey}`);
        console.log(`      Data: ${new Date(w.createdAt).toLocaleString()}`);
        console.log(`      Botões: ${w.status === 'pending' ? 'Aprovar/Negar' : 'Nenhum'}`);
        console.log('      ---');
      });
    } else {
      console.log('   ❌ NENHUM DADO - array vazio');
    }
    
    console.log('\n   setAdminWithdrawalsLoading(false) → Loading OFF');
    
    console.log('\n🎯 RESULTADO SIMULAÇÃO:');
    console.log(`   ✅ Backend: ${response.status === 200 ? 'OK' : 'FALHA'}`);
    console.log(`   ✅ Dados: ${withdrawals.length} saques`);
    console.log(`   ✅ Frontend deveria mostrar: ${withdrawals.length > 0 ? 'DADOS' : 'VAZIO'}`);
    
  } catch (error) {
    console.error('❌ ERRO na simulação:', error.message);
  }
}

testFrontend();