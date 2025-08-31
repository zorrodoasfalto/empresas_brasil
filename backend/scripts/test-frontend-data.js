const { Pool } = require('pg');

async function testFrontendData() {
  console.log('🔍 SIMULANDO DADOS DO FRONTEND');
  console.log('='.repeat(40));
  
  // Simular dados que podem estar no localStorage
  const oldUserData = {
    id: 2,
    email: 'rodyrodrigo@gmail.com',
    name: 'Rody Rodrigo'
    // Note: SEM 'role' - dados antigos
  };
  
  const newUserData = {
    id: 2,
    email: 'rodyrodrigo@gmail.com', 
    name: 'Rody Rodrigo',
    role: 'admin'
  };
  
  console.log('📱 DADOS ANTIGOS (localStorage):');
  console.log('   ', JSON.stringify(oldUserData, null, 2));
  console.log('   user?.role === "admin":', oldUserData.role === 'admin');
  console.log('   user?.email === "rodyrodrigo@gmail.com":', oldUserData.email === 'rodyrodrigo@gmail.com');
  console.log('   CONDIÇÃO:', oldUserData.role === 'admin' || oldUserData.email === 'rodyrodrigo@gmail.com');
  
  console.log('\n📱 DADOS NOVOS (após login):');
  console.log('   ', JSON.stringify(newUserData, null, 2));
  console.log('   user?.role === "admin":', newUserData.role === 'admin');
  console.log('   user?.email === "rodyrodrigo@gmail.com":', newUserData.email === 'rodyrodrigo@gmail.com');
  console.log('   CONDIÇÃO:', newUserData.role === 'admin' || newUserData.email === 'rodyrodrigo@gmail.com');
  
  // Testar API de login atual
  console.log('\n🔧 TESTANDO API DE LOGIN:');
  try {
    const response = await fetch('http://localhost:6000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rodyrodrigo@gmail.com',
        password: '123456'
      })
    });
    
    const data = await response.json();
    console.log('   Response:', JSON.stringify(data.user, null, 2));
    console.log('   ✅ Role presente:', !!data.user?.role);
    console.log('   ✅ É admin:', data.user?.role === 'admin');
    
  } catch (error) {
    console.log('   ❌ Erro na API:', error.message);
  }
}

testFrontendData();