// Usando fetch nativo do Node.js (18+)

async function testFrontendFlow() {
  console.log('🧪 TESTANDO FLUXO COMPLETO FRONTEND → BACKEND');
  console.log('='.repeat(50));
  
  try {
    // 1. Simular login
    console.log('🔐 1. Testando login...');
    const loginResponse = await fetch('http://localhost:6000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rodyrodrigo@gmail.com',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('   ✅ Login:', loginData.success ? 'SUCCESS' : 'FAIL');
    console.log('   👤 User role:', loginData.user?.role);
    
    if (!loginData.success) {
      console.log('   ❌ Login failed, stopping test');
      return;
    }
    
    const token = loginData.token;
    
    // 2. Testar endpoint de stats como admin
    console.log('\n📊 2. Testando endpoint admin/stats...');
    const statsResponse = await fetch('http://localhost:6000/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const statsData = await statsResponse.json();
    console.log('   ✅ Stats API:', statsData.success ? 'SUCCESS' : 'FAIL');
    console.log('   📈 Total Users:', statsData.stats?.totalUsers);
    console.log('   🆓 Free Users:', statsData.stats?.freeUsers);
    console.log('   💎 Premium Users:', statsData.stats?.premiumUsers);
    console.log('   ⏰ Active Trials:', statsData.stats?.activeTrials);
    
    // 3. Testar endpoint de withdrawals
    console.log('\n💰 3. Testando endpoint admin/withdrawals...');
    const withdrawalsResponse = await fetch('http://localhost:6000/api/admin/withdrawals', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const withdrawalsData = await withdrawalsResponse.json();
    console.log('   ✅ Withdrawals API:', withdrawalsData.success ? 'SUCCESS' : 'FAIL');
    console.log('   💸 Total withdrawals:', withdrawalsData.withdrawals?.length || 0);
    
    if (withdrawalsData.withdrawals?.length > 0) {
      console.log('   📋 Sample withdrawal:');
      const sample = withdrawalsData.withdrawals[0];
      console.log(`      - ID: ${sample.id}`);
      console.log(`      - Affiliate: ${sample.affiliateName}`);
      console.log(`      - Amount: R$ ${sample.amount}`);
      console.log(`      - Status: ${sample.status}`);
    }
    
    // 4. Testar acesso ao frontend
    console.log('\n🌐 4. Testando acesso ao frontend...');
    const frontendResponse = await fetch('http://localhost:4001');
    const frontendHtml = await frontendResponse.text();
    
    console.log('   ✅ Frontend accessible:', frontendResponse.ok ? 'SUCCESS' : 'FAIL');
    console.log('   📄 HTML size:', frontendHtml.length, 'characters');
    console.log('   🔍 Contains React:', frontendHtml.includes('react') ? 'YES' : 'NO');
    
    // 5. Resumo final
    console.log('\n🎯 RESUMO DO TESTE:');
    console.log('   ✅ Backend rodando:', 'OK');
    console.log('   ✅ Login funcionando:', loginData.success ? 'OK' : 'FAIL');
    console.log('   ✅ Admin role presente:', loginData.user?.role === 'admin' ? 'OK' : 'FAIL');
    console.log('   ✅ Stats API funcionando:', statsData.success ? 'OK' : 'FAIL');
    console.log('   ✅ Withdrawals API funcionando:', withdrawalsData.success ? 'OK' : 'FAIL');
    console.log('   ✅ Frontend acessível:', frontendResponse.ok ? 'OK' : 'FAIL');
    console.log('   📊 Dados disponíveis:', statsData.stats?.totalUsers > 0 ? 'OK' : 'FAIL');
    
    if (statsData.success && statsData.stats?.totalUsers > 0) {
      console.log('\n✅ CONCLUSÃO: Backend está funcionando perfeitamente!');
      console.log('   O problema deve estar na camada React do frontend:');
      console.log('   - useEffect não está executando');
      console.log('   - setState não está atualizando a UI');
      console.log('   - Componente não está re-renderizando');
    } else {
      console.log('\n❌ CONCLUSÃO: Problema encontrado no backend');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testFrontendFlow();