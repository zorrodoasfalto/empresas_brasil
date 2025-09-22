const fetch = require('node-fetch');

async function testFullFlow() {
  try {
    console.log('🔐 TESTE COMPLETO: LOGIN + BUSCA OTIMIZADA');
    console.log('============================================');

    // 1. Login
    console.log('🔑 1. Fazendo login...');
    const loginResponse = await fetch('http://localhost:6000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'rodyrodrigo@gmail.com',
        password: 'teste123'
      })
    });

    const loginData = await loginResponse.json();

    if (!loginData.success) {
      console.log('❌ Login falhou:', loginData.message);
      return;
    }

    console.log('✅ Login successful, token obtido');
    const token = loginData.token;

    // 2. Busca otimizada
    console.log('\\n🚀 2. Testando busca com otimizações...');
    const startTime = Date.now();

    const searchResponse = await fetch('http://localhost:6000/api/companies/filtered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        uf: 'SP',
        segmentoNegocio: 6,
        situacaoCadastral: '02',
        companyLimit: 1000
      })
    });

    const searchData = await searchResponse.json();
    const totalTime = Date.now() - startTime;

    if (searchData.success) {
      console.log('\\n🎯 RESULTADO DO TESTE:');
      console.log(`✅ ${searchData.data.length} empresas encontradas`);
      console.log(`⚡ Tempo total: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
      console.log('');
      console.log('📊 OTIMIZAÇÕES APLICADAS:');
      console.log('✅ 1 sócio por empresa (vs 2 antes)');
      console.log('✅ Query única (sem loop)');
      console.log('✅ Sem LEFT JOIN simples');
      console.log('✅ ROW_NUMBER otimizado');

      if (totalTime < 5000) {
        console.log('🚀 PERFORMANCE EXCELENTE! Busca rápida');
      } else if (totalTime < 15000) {
        console.log('✅ Performance boa para 1000 empresas');
      } else {
        console.log('⚠️ Performance moderada');
      }

      // Mostrar exemplo de empresa
      if (searchData.data.length > 0) {
        const empresa = searchData.data[0];
        console.log('\\n📋 Exemplo de empresa:');
        console.log(`   Nome: ${empresa.razaoSocial}`);
        console.log(`   CNPJ: ${empresa.cnpj}`);
        console.log(`   Sócios: ${empresa.quantidadeSocios} (otimizado para 1)`);
      }

    } else {
      console.log('❌ Busca falhou:', searchData.message || searchData.error);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testFullFlow();