// Test login script - Cole este código no console do navegador (F12)
// Acesse http://localhost:4001, abra o console (F12) e cole este código:

async function testLoginComplete() {
    console.clear();
    console.log('🔍 TESTE COMPLETO DE LOGIN - marketing@ogservicos.com.br');
    console.log('================================================');
    
    try {
        // 1. Testar requisição direta
        console.log('1️⃣ Testando requisição fetch...');
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'marketing@ogservicos.com.br',
                password: 'OGMarketing2025@#'
            })
        });
        
        console.log('📡 Status:', response.status);
        console.log('📡 Headers:', Object.fromEntries(response.headers));
        
        const data = await response.json();
        console.log('📄 Response:', data);
        
        if (!data.success) {
            console.error('❌ Login falhou:', data.message);
            return;
        }
        
        console.log('✅ Login response OK!');
        
        // 2. Testar armazenamento
        console.log('2️⃣ Testando localStorage...');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('💾 Token armazenado:', localStorage.getItem('token'));
        console.log('👤 User armazenado:', JSON.parse(localStorage.getItem('user')));
        
        // 3. Testar se isAuthenticated seria true
        const hasToken = !!localStorage.getItem('token');
        const hasUser = !!localStorage.getItem('user');
        const wouldBeAuthenticated = hasToken && hasUser;
        
        console.log('3️⃣ Estado de autenticação:');
        console.log('🔑 Has token:', hasToken);
        console.log('👤 Has user:', hasUser);
        console.log('✅ Would be authenticated:', wouldBeAuthenticated);
        
        // 4. Simular navegação
        console.log('4️⃣ Simulando navegação...');
        if (wouldBeAuthenticated) {
            console.log('🚀 Navegaria para /dashboard');
            // window.location.href = '/dashboard'; // Descomente para testar navegação
        } else {
            console.log('❌ NÃO navegaria - problema na autenticação');
        }
        
        console.log('================================================');
        console.log('✅ TESTE CONCLUÍDO - Verifique os resultados acima');
        
    } catch (error) {
        console.error('💥 ERRO NO TESTE:', error);
    }
}

// Executar o teste
testLoginComplete();